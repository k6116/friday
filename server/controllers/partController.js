const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index');
const moment = require('moment');
const token = require('../token/token');

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
    }).catch(error => {
        console.log(`indexParts failed: ${error}`);
        res.status(500).json({
        title: 'indexParts failed',
        error: {message: error}
      });
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
    }).catch(error => {
       console.log(`getPart failed: ${error}`);
        res.status(500).json({
        title: 'getPart failed',
        error: {message: error}
      });
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
    }).catch(error => {
        console.log(`indexPartType failed: ${error}`);
        res.status(500).json({
        title: 'indexPartTypes failed',
        error: {message: error}
      });
    })

}

function updatePart(req, res) {    
 
  const decodedToken = token.decode(req.header('X-Token'), res);
  const part = req.body;

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
          updatedBy: decodedToken.userData.id,
          updatedAt: new Date()
        },
        {
          where: {id: part.partID},
          transaction: t
        }
      )
      .then(updatedPart => { })

    }).then(() => { 
        res.json({ 
            message: `The part '${part.partName}' has been updated successfully` })
    }).catch(error => {
        console.log(`transaction rollback on updatePart: ${error}`);
        res.status(500).json({
        title: 'updatePart failed',
        error: {message: error}
      });
    })
}

function createPart(req, res) {

    const decodedToken = token.decode(req.header('X-Token'), res);
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
                createdBy: decodedToken.userData.id,
                createdAt: new Date(),
                updatedBy: decodedToken.userData.id,
                updatedAt: new Date()
            },{ where: {id: part.partID}, transaction: t 
            }).then(newPartRecord => { newPart = newPartRecord; }) 

        }).then(() => { 
            res.json({ 
                message: `The part '${part.partName}' has been created successfully`, 
                newPart: newPart })    
        }).catch(error => {
            console.log(`transaction rollback on createPart: ${error}`);           
            res.status(500).json({
            title: 'create part failed',
            error: {message: error}
          });    
        })   
    }
  
    function deletePart(req, res) {

      const decodedToken = token.decode(req.header('X-Token'), res);
      const partID = req.params.partID;   
      const scheduleID = req.params.scheduleID;   

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
            employeeID: decodedToken.userData.id,
            schedule: null,
            rowCount: null,
            errorNumber: null,
            errorMessage: null 
        }, type: sequelize.QueryTypes.SELECT})
          .then(sched => {                      
             return models.Part.destroy({where: {id: partID}}) //foreign key issue
            //  return  sequelize.query(`DELETE parts.Parts WHERE PartID = ${partID}`).then(p => {})                    
          });
          }).then(() => { 
              res.json({ message: `The Part '${partID}' has been deleted successfully`})      
          }).catch(error => {
              console.log(`transaction rollback on deletePart: ${error}`);
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
    deletePart: deletePart
}
