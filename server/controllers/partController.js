const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index');
const moment = require('moment');

function indexParts(req, res) {    

    const sql = `
    SELECT 
        *   
    FROM  
        parts.Parts    
    ORDER BY 
        PartName`
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {    
     res.json(p);
    })

}

function getPart(req, res) {    
    const partID = req.params.partID;
    const sql = `
    SELECT 
        *       
    FROM  
        parts.Parts
    WHERE
        PartID = '${partID}'`
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {    
     res.json(p);
    })

}

function indexPartTypes(req, res) {    

    const sql = `
     SELECT 
        PartTypeID, 
        PartTypeName
    FROM  
        parts.PartTypes   
    ORDER BY 
        PartTypeName`
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {    
     res.json(p);
    })

}

function updatePart(req, res) {    
 
  const userID = req.params.userID;
  const part = req.body;

  console.log('updating existing part:');
  console.log(part);

  return sequelize.transaction((t) => {

    return models.Part
      .update(
        {      
          description: part.description,      
          partTypeID: part.partTypeID,       
          designerEmployeeID: part.designerEmployeeID,
          plannerEmployeeID: part.plannerEmployeeID,
          dutFamily: part.dutFamily,
          oracleItemNumber: part.oracleItemNumber,      
          oracleDescription: part.oracleDescription,      
          notes: part.notes,      
          itemStatus: part.itemStatus,      
          updatedBy: userID,
          updatedAt: new Date()
        },
        {
          where: {id: part.partID},
          transaction: t
        }
      )
      .then(updatedPart => {
        console.log('Updated Part')
        console.log(updatedPart);
      })

    }).then(() => {
      res.json({
        message: `The part '${part.partName}' has been updated successfully`
      })

    }).catch(error => {

      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });

    })

}

function createPart(req, res) {

    const userID = req.params.userID;
    const part = req.body;
    var newPart;

    return sequelize.transaction((t) => {

        return models.Part
          .create(
            {        
                partName: part.partName,          
                description: part.description,      
                partTypeID: part.partTypeID,       
                designerEmployeeID: part.designerEmployeeID,
                plannerEmployeeID: part.plannerEmployeeID,
                dutFamily: part.dutFamily,
                oracleItemNumber: part.oracleItemNumber,      
                oracleDescription: part.oracleDescription,      
                notes: part.notes,      
                itemStatus: part.itemStatus,
                createdBy: userID,
                createdAt: new Date(),
                updatedBy: userID,
                updatedAt: new Date()
            },
            {
              where: {id: part.partID},
              transaction: t
            }
          )
          .then(newPartRecord => {
            console.log('Created Part')
            console.log(newPart);
            newPart = newPartRecord;
          })
    
        }).then(() => {
          res.json({
            message: `The part '${part.partName}' has been created successfully`,
            newPart: newPart
          })
    
        }).catch(error => {
    
          console.log(error);
          res.status(500).json({
            title: 'create part failed',
            error: {message: error}
          });
    
        })   
    }
  
    function destroyPart(req, res) {

      const partID = req.params.partID;   
      const scheduleID = req.params.scheduleID;   
      const userID = req.params.userID;          
    
      return sequelize.transaction((t) => {    
        return  sequelize.query(`EXECUTE dbo.Schedules 
        :executeType, 
        :scheduleID,
        :projectID,  
        :partID,
        :notes,
        :employeeID,
        :schedule,
        :rowCount,
        :errorNumber,
        :errorMessage`, { replacements: {
            executeType: 'Delete',
            scheduleID: scheduleID,
            projectID: null,
            partID: partID,
            notes: null,
            employeeID: userID,
            schedule: null,
            rowCount: null,
            errorNumber: null,
            errorMessage: null 
        }, type: sequelize.QueryTypes.SELECT})
          .then(sched => {  
            models.Part
            .destroy(
              {
                where: {partID: partID},
                transaction: t
              }
            )
            .then(deletedPart => {  
            });            
          });
        }).then(() => {    
           res.json({
           message: `The Part '${part.partName}' has been deleted successfully`,
          })
    
        }).catch(error => {    
          console.log(error);
          res.status(500).json({
            title: 'destroy part failed',
            error: {message: error}
          });    
        })    
    }


    module.exports = {
    indexParts: indexParts,
    getPart: getPart,
    indexPartTypes: indexPartTypes,
    updatePart: updatePart,
    createPart: createPart,
    destroyPart: destroyPart
}
