const sequelize = require('../db/sequelize').sequelize;

function indexParts(req, res) {    

    const sql = `
     SELECT 
        PartID, 
        PartName,
        Description,
        OracleDescription,
        OracleItemNumber,
        DUTFamily,
        ItemStatus,
        DesignerEmployeeID,
        PlannerEmployeeID,
        Notes,
        PartTypeID        
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
        PartID, 
        PartName,
        Description,
        OracleItemNumber,
        DUTFamily,
        PartStatus,
        DesignerEmployeeID,
        PlannerEmployeeID,
        Notes,
        PartTypeID               
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

module.exports = {
    indexParts: indexParts,
    getPart: getPart,
    indexPartTypes: indexPartTypes
}
