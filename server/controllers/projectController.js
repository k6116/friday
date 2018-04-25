const sequelize = require('../db/sequelize').sequelize;

function getAll(req, res) {
   
    console.log('reached project controller');

    var sql = 'SELECT p.ProjectID, substring(p.ProjectName,1,30) as \'ProjectName\', substring(p.Description,1,500) as \'Description\', e.FullName, p.CreationDate, t.ProjectTypeName ';
    sql = sql + 'FROM  projects.Projects p INNER JOIN projects.ProjectTypes t ';
    sql = sql + 'ON p.ProjectTypeID = t.ProjectTypeID '
    sql = sql + 'INNER JOIN accesscontrol.Employees e on p.CreatedBy = e.EmployeeID '
    sql = sql + 'WHERE Active = 1 AND len(p.Description) > 0 '
    sql = sql + 'ORDER BY p.ProjectName '
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {
    console.log("Returning Projects");
    console.log(p);
     res.json(p);
    })  
}

module.exports = {
    getAll: getAll
}
