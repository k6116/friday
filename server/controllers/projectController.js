const sequelize = require('../db/sequelize').sequelize;
const models = require('../models/_index')
const moment = require('moment');
const Treeize = require('treeize');

function getAll(req, res) {
   
    // console.log('reached project controller');

    var sql = 'SELECT p.ProjectID, substring(p.ProjectName,1,30) as \'ProjectName\', substring(p.Description,1,500) as \'Description\', e.FullName, p.CreationDate, t.ProjectTypeName ';
    sql = sql + 'FROM  projects.Projects p INNER JOIN projects.ProjectTypes t ';
    sql = sql + 'ON p.ProjectTypeID = t.ProjectTypeID '
    sql = sql + 'INNER JOIN accesscontrol.Employees e on p.CreatedBy = e.EmployeeID '
    sql = sql + 'WHERE Active = 1 AND len(p.Description) > 0 '
    sql = sql + 'ORDER BY p.ProjectName '
    
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
    .then(p => {
    // console.log("Returning Projects");
    // console.log(p);
     res.json(p);
    })

}

function getProjectRoster(req, res) {

  const projectID = req.params.projectID;
  const month = moment().utc().startOf('month').format('YYYY-MM-DD')

  const sql = `
    SELECT 
      T1.ProjectID as 'projectID',
      T1.ProjectName as 'projectName',
      T1.[Description] as 'description',
      T3.FullName as 'teamMembers:name',
      T2.FTE as 'teamMembers:fte'
    FROM 
      projects.Projects T1
      LEFT JOIN resources.ProjectEmployees T2 ON T1.ProjectID = T2.ProjectID
      LEFT JOIN accesscontrol.Employees T3 ON T2.EmployeeID = T3.EmployeeID
    WHERE 
      T1.ProjectID = ${projectID}
      AND T2.FiscalDate = '${month}'
  `

  sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
  .then(projectTeamData => {
    const projectTeamTree = new Treeize();
    projectTeamTree.grow(projectTeamData);
    const projectTeam = projectTeamTree.getData();
    res.json(projectTeam);
  })
  .catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });


}

module.exports = {
  getAll: getAll,
  getProjectRoster: getProjectRoster
}
