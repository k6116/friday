
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

function indexSuppliers(req, res) {
  models.Supplier.findAll()
  .then(supplierList => {
    res.json(supplierList);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function indexPurchaseMethod(req, res) {
  models.PurchaseMethod.findAll()
  .then(pmList => {
    res.json(pmList);
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
      T1.ScheduleID,
      T1.ProjectID,
      T1.CurrentRevision,
      T1.Notes,
      FORMAT(T2.NeedByDate, 'yyyy-MM-dd') AS 'NeedByDate',
      T2.NeededQuantity,
      T2.BuildStatusID,
      T4.BuildStatusName,
      T3.MaterialPlanID,
      T1.LastUpdateDate AS ScheduleUpdateDate,
      T1.LastUpdatedBy AS ScheduleUpdatedBy,
      T2.LastUpdateDate AS SchedulesDetailUpdateDate,
      T2.LastUpdatedBy AS SchedulesDetailUpdatedBy,
      T3.LastUpdateDate AS MatplanUpdateDate,
      T3.LastUpdatedBy AS MatplanUpdatedBy,
      T5.FullName AS MatplanUpdatedByName
    FROM demand.Schedules T1
    LEFT JOIN demand.SchedulesDetail T2
        ON T1.ScheduleID = T2.ScheduleID
    LEFT JOIN (
      SELECT *
      FROM supply.MaterialPlan
      WHERE ProjectID = :projectID
    ) T3
        ON T2.BuildStatusID = T3.BuildStatusID
    LEFT JOIN projects.BuildStatus T4
        ON T2.BuildStatusID = T4.BuildStatusID
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
    // add some indention dashes to make the BOM easier to read
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
      'supplierID',
      'supplier.supplierName',
      'mfgPartNumber',
      ['quoteID', 'breaks|quoteID'],
      ['leadTime', 'breaks|leadTime'],
      ['minOrderQty', 'breaks|minOrderQty'],
      ['price', 'breaks|price'],
      ['nreCharge', 'breaks|nreCharge']
    ],
    where: {partID: partID},
    include: [{
      model: models.Supplier,
      attributes: []
      // empty attributes trick to prevent having a fully-qualified property name (ie, field = suppliers.supplierName instead of supplierName)
      // see https://github.com/sequelize/sequelize/issues/7605
    }]
  })
  .then(quoteList => {
    console.log(quoteList);
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

function showSpecificQuote(req, res) {
  const partID = req.params.partID;
  const supplierID = req.params.supplierID;
  models.Quote.findAll({
    attributes: [
      'partID',
      'supplierID',
      'supplier.supplierName',
      'mfgPartNumber',
      'quoteID',
      'leadTime',
      'minOrderQty',
      'price',
      'nreCharge'
    ],
    where: {
      partID: partID,
      supplierID: supplierID
    },
    order: [
      ['minOrderQty', 'ASC']
    ],
    include: [{
      model: models.Supplier,
      // attributes: []
      // // empty attributes trick to prevent having a fully-qualified property name (ie, field = suppliers.supplierName instead of supplierName)
      // // see https://github.com/sequelize/sequelize/issues/7605
    }],
    raw: true
  })
  .then(quoteList => {
    res.json(quoteList);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function destroyQuoteForPart(req, res) {
  const quoteForm = req.body;
  const quoteName = quoteForm.supplierName;
  const deleteIDs = [];

  quoteForm.breaks.forEach( priceBreak => {
    deleteIDs.push(priceBreak.quoteID);
  });

  console.log('finished parsing IDs to delete');

  return models.Quote.destroy({where: {quoteID: deleteIDs}})
  .then(() => {
    res.json({
      message: `${quoteName} quote deleted!`
    })
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: 'quote delete failed',
      error: error
    });
  });
}

function updateQuoteForPart(req, res) {
  const decodedToken = token.decode(req.header('X-Token'), res);
  const userID = decodedToken.userData.id;
  const quoteForm = req.body;
  const quoteName = quoteForm.supplierName;
  const insertSuppliers = [];
  const insertQuotes = [];
  const updateQuotes = [];
  const deleteIDs = [];

  // parse the form to see if supplier is a new one to be inserted (is missing supplierID)
  if (!quoteForm.supplierID) {
    insertSuppliers.push({
      supplierName: quoteForm.supplierName
    });
  }
  // parse the form to separate out quote records to be deleted/inserted/updated, and suppliers to be inserted
  quoteForm.breaks.forEach( priceBreak => {
    if (priceBreak.toBeDeleted) {
      deleteIDs.push(priceBreak.quoteID);
    }
    else if (priceBreak.quoteID) {
      updateQuotes.push({
        quoteID: priceBreak.quoteID,
        partID: quoteForm.partID,
        supplierID: quoteForm.supplierID,
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
      insertQuotes.push({
        partID: quoteForm.partID,
        supplierID: quoteForm.supplierID,
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

  console.log('done parsing delete values');
  console.log(deleteIDs);
  console.log('done parsing insertQuotes');
  console.log(insertQuotes);
  console.log('done parsing updateQuotes');
  console.log(updateQuotes);
  console.log('done parsing insert suppliers');
  console.log(insertSuppliers);

  return sequelize.transaction( (t) => {
    // first, destroy the quote records that the user requested to delete
    return models.Quote.destroy({
      where: {quoteID: deleteIDs},
      transaction: t
    })
    .then( deletedQuotes => {
      console.log(`${deletedQuotes} quote records deleted`);

      // next, add any new suppliers, if the user created any
      return models.Supplier.bulkCreate(
        insertSuppliers,
        {transaction: t}
      )
      .then( () => {
        // then, get the newly created supplierIDs of those suppliers
        return models.Supplier.findAll({
          transaction: t,
          raw: true
        })
        .then( supplierTable => {
          // if we had a new supplier, add the new supplierID to the new Quotes for insert
          if (insertSuppliers.length > 0) {
            const newSupplier = supplierTable.find( entry => entry.supplierName === insertSuppliers[0].supplierName);
            if (newSupplier !== undefined) {
              insertQuotes.forEach( quote => {
                quote.supplierID = newSupplier.supplierID;
              })
            }
          }
          // then, bulkcreate the new quote records
          return models.Quote.bulkCreate(
            insertQuotes,
            {transaction: t}
          )
          .then( (insertedRecords) => {
            console.log(`${insertedRecords.length} quote records added`);
    
            // make array of promises to perform a bulkUpdate of quote records
            let promises = [];
            for (let i = 0; i < updateQuotes.length; i++) {
              let newPromise = models.Quote.update(
                {
                  quoteID: updateQuotes[i].quoteID,
                  partID: updateQuotes[i].partID,
                  supplierID: updateQuotes[i].supplierID,
                  mfgPartNumber: updateQuotes[i].mfgPartNumber,
                  leadTime: updateQuotes[i].leadTime,
                  minOrderQty: updateQuotes[i].minOrderQty,
                  price: updateQuotes[i].price,
                  nreCharge: updateQuotes[i].nreCharge,
                  demandForecastMethodID: updateQuotes[i].demandForecastMethodID,
                  demandForecastMethodNumber: updateQuotes[i].demandForecastMethodNumber,
                  updatedBy: updateQuotes[i].updatedBy,
                  updatedAt: updateQuotes[i].updatedAt
                },
                {
                  where: { quoteID: updateQuotes[i].quoteID },
                  transaction: t
                }
              );
              promises.push(newPromise);
            };
            // then execute all the promises to update the quote records
            return Promise.all(promises);
          })
          .then( updatedRecords => {
            console.log(`${updatedRecords.length} quote records updated`)
          });
        });
      });
    });
  }) // end transaction
  .then(() => {
    res.json({
      message: `${quoteName} quote saved!`
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

function updateMaterialOrder(req, res) {
  const decodedToken = token.decode(req.header('X-Token'), res);
  const userID = decodedToken.userData.id;
  const matOrderForm = req.body.matplan;
  const matplanID = req.body.matplanID;
  const insertOrders = [];
  const updateOrders = [];

  // if order is missing matOrderID, then it is new.  Otherwise, it is an update (because the frontend has already parsed out the no-changes records)
  matOrderForm.forEach( order => {
    if (order.materialOrderID === null) {
      insertOrders.push({
        materialPlanID: matplanID,  // new records won't have a matplanID, so we need to get the one sent from the frontend
        partID: order.partID,
        supplierID: order.supplierID,
        purchaseMethodID: (order.purchaseMethodID === '') ? null : order.purchaseMethodID,
        purchaseOrderNumber: (order.purchaseOrderNumber === '') ? null : order.purchaseOrderNumber,
        orderQty: (order.orderQty === '') ? null : order.orderQty,
        orderDate: (order.orderDate === '') ? null : order.orderDate,
        dueDate: (order.dueDate === '') ? null : order.dueDate,
        qtyReceived: (order.qtyReceived === '') ? null : order.qtyReceived,
        dateReceived: (order.dateReceived === '') ? null : order.dateReceived,
        deliverTo: (order.deliverTo === '') ? null : order.deliverTo,
        notes: (order.notes === '') ? null : order.notes,
        createdBy: userID,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
      });
    } else {
      updateOrders.push({
        materialOrderID: order.materialOrderID,
        materialPlanID: order.materialPlanID,
        partID: order.partID,
        supplierID: order.supplierID,
        purchaseMethodID: (order.purchaseMethodID === '') ? null : order.purchaseMethodID,
        purchaseOrderNumber: (order.purchaseOrderNumber === '') ? null : order.purchaseOrderNumber,
        orderQty: (order.orderQty === '') ? null : order.orderQty,
        orderDate: (order.orderDate === '') ? null : order.orderDate,
        dueDate: (order.dueDate === '') ? null : order.dueDate,
        qtyReceived: (order.qtyReceived === '') ? null : order.qtyReceived,
        dateReceived: (order.dateReceived === '') ? null : order.dateReceived,
        deliverTo: (order.deliverTo === '') ? null : order.deliverTo,
        notes: (order.notes === '') ? null : order.notes,
        createdBy: userID,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
      });
    }
  });

  console.log('done parsing insertOrders');
  console.log(insertOrders);
  console.log('done parsing updateOrders');
  console.log(updateOrders);

  return sequelize.transaction( (t) => {
    // first, destroy the quote records that the user requested to delete
    return models.MaterialOrder.bulkCreate(
      insertOrders,
      {transaction: t}
    )
    .then( insertedRecords => {
      console.log(`${insertedRecords.length} matOrder records inserted`);

      // make array of promises to perform a bulkUpdate of quote records
      let promises = [];
      for (let i = 0; i < updateOrders.length; i++) {
        let newPromise = models.MaterialOrder.update(
        {
          materialPlanID: updateOrders[i].materialPlanID,
          partID: updateOrders[i].partID,
          supplierID: updateOrders[i].supplierID,
          purchaseMethodID: updateOrders[i].purchaseMethodID,
          purchaseOrderNumber: updateOrders[i].purchaseOrderNumber,
          orderQty: updateOrders[i].orderQty,
          orderDate: updateOrders[i].orderDate,
          dueDate: updateOrders[i].dueDate,
          qtyReceived: updateOrders[i].qtyReceived,
          dateReceived: updateOrders[i].dateReceived,
          deliverTo: updateOrders[i].deliverTo,
          notes: updateOrders[i].notes,
          createdBy: updateOrders[i].createdBy,
          createdAt: updateOrders[i].createdAt,
          updatedBy: updateOrders[i].updatedBy,
          updatedAt: updateOrders[i].updatedAt
        },
        {
          where: { materialOrderID: updateOrders[i].materialOrderID },
          transaction: t
        });
        promises.push(newPromise);
      };
      // then execute all the promises to update the quote records
      return Promise.all(promises);
    })
    .then( updatedRecords => {
      console.log(`${updatedRecords.length} matOrder records updated`)
    });
  }) // end transaction
  .then(() => {
    res.json({
      message: `Matplan saved!`
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

function showMatplanOrders(req, res) {
  const projectID = req.params.projectID;
  const matplanID = req.params.matplanID;
  sequelize.query(`EXECUTE resources.GetMatOrder :projectID, :matplanID`,
    {replacements: {projectID: projectID, matplanID: matplanID}, type: sequelize.QueryTypes.SELECT}
  )
  .then(orderList => {
    console.log(orderList);
    // treeize the price breaks into nested JSON
    const orderTree = new Treeize();
    orderTree.grow(orderList);
    res.json(orderTree.getData());
    // res.json(orderList);
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
  indexSuppliers: indexSuppliers,
  indexPurchaseMethod: indexPurchaseMethod,
  indexProjects: indexProjects,
  showMatplans: showMatplans,
  showMatplanBom: showMatplanBom,
  showQuotesForPart: showQuotesForPart,
  showSpecificQuote: showSpecificQuote,
  destroyQuoteForPart: destroyQuoteForPart,
  updateQuoteForPart: updateQuoteForPart,
  updateMaterialOrder: updateMaterialOrder,
  showMatplanOrders: showMatplanOrders
}
