
const models = require('../models/_index');
const sequelize = require('../db/sequelize').sequelize;
const token = require('../token/token');
const Treeize = require('treeize');
const moment = require('moment');


function show(req, res) {
  const matplanID = req.params.matplanID;
  sequelize.query(`
    SELECT *
    FROM supply.MaterialPlan T1
    LEFT JOIN projects.Projects T2
      ON T1.ProjectID = T2.ProjectID
    LEFT JOIN
      (SELECT T1.ScheduleID,
      T1.ProjectID,
      T2.BuildStatusID,
      T2.NeedByDate,
      T2.NeededQuantity,
      T3.BuildStatusName
      FROM demand.Schedules T1
      LEFT JOIN demand.SchedulesDetail T2
        ON T1.ScheduleID = T2.ScheduleID
      LEFT JOIN projects.BuildStatus T3
	      ON T2.BuildStatusID = T3.BuildStatusID
      ) T3
      ON T1.ProjectID = T3.ProjectID
      AND T1.BuildStatusID = T3.BuildStatusID
    WHERE MaterialPlanID = :matplanID
  `,{replacements: {matplanID: matplanID}, type: sequelize.QueryTypes.SELECT}
  )
  .then(matplan => {
    res.json(matplan);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function indexProjects(req, res) {
  sequelize.query(
    // select NPIs and NMIs
    `SELECT DISTINCT
      T1.ProjectID,
      CONCAT(T1.ProjectName, ' - ', T2.ProjectTypeName) AS ProjectName
    FROM projects.Projects T1
    LEFT JOIN projects.ProjectTypes T2
      ON T1.ProjectTypeID = T2.ProjectTypeID
    WHERE T1.ProjectTypeID IN (2, 13)
    ORDER BY ProjectName`, {type: sequelize.QueryTypes.SELECT}
  )
  .then(matplanList => {
    res.json(matplanList);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function showMatplans(req, res) {
  const projectID = req.params.projectID;
  sequelize.query(`
    SELECT 
      T1.ProjectID,
      T2.NeedByDate,
      T2.NeededQuantity,
      T2.BuildStatusID,
      T4.BuildStatusName,
      T3.MaterialPlanID,
      T3.LastUpdateDate AS MatplanUpdateDate,
      T3.LastUpdatedBy AS MatplanUpdatedBy,
      T5.FullName AS MatplanUpdatedByName
    FROM demand.Schedules T1
    LEFT JOIN demand.SchedulesDetail T2
        ON T1.ScheduleID = T2.ScheduleID
    LEFT JOIN supply.MaterialPlan T3
        ON T2.BuildStatusID = T3.BuildStatusID
    LEFT JOIN projects.BuildStatus T4
        ON T3.BuildStatusID = T4.BuildStatusID
    LEFT JOIN accesscontrol.Employees T5
      ON T3.LastUpdatedBy = T5.EmployeeID
    WHERE T1.ProjectID = :projectID
      AND T2.BuildStatusID IS NOT NULL`, {replacements: {projectID: projectID}, type: sequelize.QueryTypes.SELECT}
  )
  .then(buildList => {
    res.json(buildList);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function showMatplanBom(req, res) {
  const projectID = req.params.projectID;
  sequelize.query(`EXECUTE dbo.billsDrillDownDetails :projectID, 'Project'`,{replacements: {projectID: projectID}, type: sequelize.QueryTypes.SELECT}
  )
  .then(bom => {
    bom.forEach( item => {
      if (item.Level > 1) {
        const indentedName = new Array(item.Level - 1).concat(item.ChildName);
        item.ChildIndentedName = indentedName.join('-');
      } else {
        item.ChildIndentedName = item.ChildName;
      }
    });
    res.json(bom);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function showQuotesForPart(req, res) {
  const partID = req.params.partID;
  models.Quote.findAll({
    attributes: [
      'partID',
      'quoteID',
      'supplier',
      'mfgPartNumber',
      ['id', 'breaks|id'],
      ['leadTime', 'breaks|leadTime'],
      ['minOrderQty', 'breaks|minOrderQty'],
      ['price', 'breaks|price'],
      ['nreCharge', 'breaks|nreCharge']
    ],
    where: {
      partID: partID
    },
    raw: true
  })
  .then(quoteList => {
    // treeize the price breaks into nested JSON
    const quoteTree = new Treeize().options({input: {delimiter: '|'}});
    quoteTree.grow(quoteList);
    res.json(quoteTree.getData());
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function updateQuoteForPart(req, res) {
  const decodedToken = token.decode(req.header('X-Token'), res);
  const userID = decodedToken.userData.id;
  const quoteForm = req.body;
  const insertValues = [];
  const updateValues = [];

  quoteForm.breaks.forEach( priceBreak => {
    if (priceBreak.id) {
      updateValues.push({
        id: priceBreak.id,
        quoteID: quoteForm.quoteID,
        partID: quoteForm.partID,
        supplier: quoteForm.supplier,
        mfgPartNumber: quoteForm.mfgPartNumber,
        leadTime: priceBreak.leadTime,
        minOrderQty: priceBreak.minOrderQty,
        price: priceBreak.price,
        nreCharge: priceBreak.nreCharge,
        demandForecastMethodID: 1,
        demandForecastMethodNumber: 'dunno',
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
    } else {
      insertValues.push({
        quoteID: quoteForm.quoteID,
        partID: quoteForm.partID,
        supplier: quoteForm.supplier,
        mfgPartNumber: quoteForm.mfgPartNumber,
        leadTime: Number(priceBreak.leadTime),
        minOrderQty: Number(priceBreak.minOrderQty),
        price: Number(priceBreak.price),
        nreCharge: Number(priceBreak.nreCharge),
        demandForecastMethodID: 1,
        demandForecastMethodNumber: 'dunno',
        createdBy: userID,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
    }
  });

  console.log('done parsing newValues');
  console.log(insertValues);
  console.log('done parsing updateValues');
  console.log(updateValues);

  // res.json({message: 'bla'});

  return sequelize.transaction( (t) => {
    return models.Quote.bulkCreate(
      insertValues,
      {transaction: t}
    )
    .then( (insertedRecords) => {
      console.log(`${insertedRecords.length} quote records added`);

      // make array of promises to update all quote records
      let promises = [];
      for (let i = 0; i < updateValues.length; i++) {
        let newPromise = models.Quote.update(
          {
            id: updateValues[i].id,
            quoteID: updateValues[i].quoteID,
            partID: updateValues[i].partID,
            supplier: updateValues[i].supplier,
            mfgPartNumber: updateValues[i].mfgPartNumber,
            leadTime: updateValues[i].leadTime,
            minOrderQty: updateValues[i].minOrderQty,
            price: updateValues[i].price,
            nreCharge: updateValues[i].nreCharge,
            demandForecastMethodID: updateValues[i].demandForecastMethodID,
            demandForecastMethodNumber: updateValues[i].demandForecastMethodNumber,
            updatedBy: updateValues[i].updatedBy,
            updatedAt: updateValues[i].updatedAt
          },
          {
            where: { id: updateValues[i].id },
            transaction: t
          }
        );
        promises.push(newPromise);
      };
      return Promise.all(promises);
    })
    .then( updatedRecords => {
      console.log(`${updatedRecords.length} quote records updated`)
    });
  }) // end transaction
  .then(() => {
    res.json({
      message: 'Quote has been saved'
    })
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: 'quote save failed',
      error: error
    });
  });
}

function showOrdersForPart(req, res) {
  const matplanID = req.params.matplanID;
  const partID = req.params.partID;
  sequelize.query(`
    SELECT *
    FROM supply.MaterialOrder
    WHERE MaterialPlanID = :matplanID AND PartID = :partID`, {replacements: {matplanID: matplanID, partID: partID}, type: sequelize.QueryTypes.SELECT})
  .then(orderList => {
    res.json(orderList);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}


module.exports = {
  show: show,
  indexProjects: indexProjects,
  showMatplans: showMatplans,
  showMatplanBom: showMatplanBom,
  showQuotesForPart: showQuotesForPart,
  updateQuoteForPart: updateQuoteForPart,
  showOrdersForPart: showOrdersForPart
}
