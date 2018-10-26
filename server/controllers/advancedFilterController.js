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

function indexAdvancedFilteredResults(req, res) {

  /* Some notes about expected parameter formats.
      All parameter must be strings. That means even the NULL values should be enclosed in quotes.
      Only the FTE parameters do not allow empty strings, must

      PLCStatusIDs: '' OR '1,4,5,6'
        - Comma delimited PLCStatusIDs
      PLCDateRanges: '' OR 'NULL|NULL,2017-05-01|2019-09-01,2017-05-01|2019-09-01,NULL|NULL'
        - Must sync with the comma delimited IDs in the PLCStatusIDs (4 IDs means 4 date ranges)
        - Each set of dates are comma delimited. Use pipes to separate the "from" and "to" within each date range.
      ProjectName: '' OR 'someprojectname'
        - This will be a wildcard search in the stored procedure
      ProjectTypeIDs: '' OR '1,2,3'
        - Comma delimited ProjectTypeIDs
      ProjectStatusIDs: '' OR '1,2,3'
        - Comma delimited ProjectStatusIDs
      ProjectPriorityIDs: '' OR '1,2,3'
        - Comma delimited ProjectPriorityIDs
      ProjectOwnerEmails: '' OR 'someemployee1@keysight.com,someemployee2@keysight.com'
        - Comma delimited email addresses
      FTEMin: 'NULL' OR '1.5'
        - Both NULL and integer passed as a string
      FTEMax: 'NULL' OR '12.3'
        - Both NULL and integer passed as a string
      FTEDateFrom: 'NULL' OR '2018-01-05'
        - Both NULL and date passed as a string
      FTEDateTo: 'NULL' OR '2019-12-05'
        - Both NULL and date passed as a string
  */

  const filterOptions = req.body;

  const sql = `
    EXECUTE filters.AdvancedFilter :PLCStatusIDs, :PLCDateRanges, :ProjectName, :ProjecTypeIDs,
     :ProjectStatusIDs, :ProjectPriorityIDs, :ProjectOwnerEmails, :FTEMin, :FTEMax, :FTEDateFrom, :FTEDateTo
    `
  
  sequelize.query(sql, {replacements: {PLCStatusIDs: filterOptions.PLCStatusIDs, PLCDateRanges: filterOptions.PLCDateRanges, ProjectName: filterOptions.ProjectName,
                                      ProjectTypeIDs: filterOptions.ProjectTypeIDs, ProjectStatusIDs: filterOptions.ProjectStatusIDs, ProjectPriorityIDs: filterOptions.ProjectPriorityIDs,
                                      ProjectOwnerEmails: filterOptions.ProjectOwnerEmails, FTEMin: filterOptions.FTEMin, FTEMax: filterOptions.FTEMax, FTEDateFrom: filterOptions.FTEDateFrom, FTEDateTo: filterOptions.FTEDateTo},
                        type: sequelize.QueryTypes.SELECT})
  .then(filteredRes => {    
    res.json(filteredRes);
  }).catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

function indexProjectChildren(req, res) {
  const projectName = req.params.projectName;
  const sql = `EXECUTE dbo.BillsDrillDownProjects :projectName`
  sequelize.query(sql, {replacements: {projectName: projectName}, type: sequelize.QueryTypes.SELECT})
  .then(children => {    
    res.json(children);
  }).catch(error => {
    res.status(400).json({
      title: 'Error (in catch)',
      error: {message: error}
    })
  });
}

module.exports = {
    indexProjectsAdvancedFilter: indexProjectsAdvancedFilter,
    indexAdvancedFilteredResults: indexAdvancedFilteredResults,
    indexProjectChildren: indexProjectChildren
}
