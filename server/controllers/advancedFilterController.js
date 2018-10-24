const sequelize = require('../db/sequelize').sequelize;
const moment = require('moment');
const treeize = require('treeize');

function indexProjectsAdvancedFilter(req, res) {

    const sql = `
     SELECT 
        p.ProjectID,
        p.ProjectName,
        t.ProjectTypeName,
        py.PriorityName,
        s.ProjectStatusName,
        p.ProjectOwner,
        p.Description,
        p.Notes,
        p.MU,
        p.IBO,
        p.ProjectNumber,
        p.OracleItemNumber,
        p.NPIHWProjectManager,
        p.CreationDate,
        e1.FullName as 'CreatedBy',
        p.LastUpdateDate,
        e2.FullName as 'LastUpdatedBy'
    FROM  
        projects.Projects p
        LEFT JOIN projects.ProjectTypes t ON p.ProjectTypeID = t.ProjectTypeID
        LEFT JOIN projects.Priority py ON p.PriorityID = py.PriorityID
        LEFT JOIN projects.ProjectStatus s ON p.ProjectStatusID = s.ProjectStatusID
        INNER JOIN accesscontrol.Employees e1 on p.CreatedBy = e1.EmployeeID
        INNER JOIN accesscontrol.Employees e2 ON p.LastUpdatedBy = e2.EmployeeID
    ORDER BY 
        p.ProjectName`
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {    
     res.json(p);
    })

}

module.exports = {
    indexProjectsAdvancedFilter: indexProjectsAdvancedFilter,
}
