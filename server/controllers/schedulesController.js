const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');
const Treeize = require('treeize');

function indexSchedules(req, res) {
	const sql =
		`SELECT 
			p.ProjectID as 'projectID*', 
			p.ProjectName as projectName,
			p.Description as description,
			pt.ProjectTypeID as projectTypeID, 
			pt.ProjectTypeName projectTypeName,
			p.Active as active,
			py.PriorityID as priorityID,
            py.PriorityName as priorityName,
			p.CreationDate as creationDate,
			p.CreatedBy as createdBy,
			p.LastUpdatedBy as lastUpdatedBy,
			p.LastUpdateDate as lastUpdateDate,  
			s.ScheduleID as 'schedules:scheduleID', 
			sd.PLCDate as 'schedules:plcDate', 
			plc.PLCStatusID as 'schedules:plcStatusID', 
			plc.PLCStatusName as 'schedules:plcStatusName'
		FROM
			projects.Projects p
			LEFT JOIN projects.ProjectTypes pt ON p.ProjectTypeID = pt.ProjectTypeID
			LEFT JOIN projects.Priority py ON p.PriorityID = py.PriorityID
			LEFT JOIN demand.Schedules s ON p.ProjectID = s.ProjectID
			LEFT JOIN demand.SchedulesDetail sd ON s.ScheduleID = sd.ScheduleID
			LEFT JOIN projects.PLCStatus plc ON sd.PLCStatusID = plc.PLCStatusID
		ORDER BY 
			p.ProjectName`

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
		.then(indexSchedule => {
			const scheduleTree = new Treeize();
			scheduleTree.grow(indexSchedule);
			const schedule = scheduleTree.getData();    
			res.json(schedule);
		})
}


function getPartSchedule(req, res) {
	const partID = req.params.partID;
	const sql =
		`SELECT 		
			f.ScheduleID,
			f.PartID,		
			f.CurrentRevision,
			f.notes as 'RevisionNotes', 
			convert(varchar(10), d.needbydate, 120) as 'NeedByDate', 
			d.NeededQuantity, 
			d.BuildStatusID,
			d.Notes,
			DeleteRow = 0
		FROM
			vSchedulesForm f 
		INNER JOIN 
			vSchedulesDetail d on d.scheduleid = f.scheduleid
		WHERE
			f.PartID = '${partID}'
		ORDER BY 
			NeedByDate`

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
		.then(schedule => {		
			res.json(schedule);
		})
}


function updatePartSchedule(req,res) {

	const userID = req.params.userID;
	const revisionNotes = req.params.revisionNotes;
	const schedule = req.body;

	var scheduleXML = `<Schedules>`;
	schedule.forEach(element => {
		   if (element.DeleteRow === false || element.DeleteRow === 0) {
			scheduleXML = scheduleXML + 
			`<Schedule 
			NeedByDate='${element.NeedByDate}' 
			NeededQuantity='${element.NeededQuantity}' 
			ProjectStatusID='${element.BuildStatusID}' 
			Notes='${element.Notes}' 
			PLCDate='' 
			PLCStatusID='' />` 	
			}		
		});
	scheduleXML = scheduleXML + '</Schedules>'
	
	
  if (schedule[0].ScheduleID > 0) { // EDIT EXISTING
	sequelize.query(`EXECUTE dbo.Schedules 
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
			executeType: 'Edit',
			scheduleID: schedule[0].ScheduleID,
			projectID: null,
			partID: schedule[0].PartID,
			notes: revisionNotes,
			employeeID: userID,
			schedule: scheduleXML,
			rowCount: null,
			errorNumber: null,
			errorMessage: null 
	}, type: sequelize.QueryTypes.SELECT})
    .then(sched => {
      console.log("execute dbo.Schedules ");
      res.json(sched);
    })
    .catch(error => {
      res.status(400).json({
        title: 'Error (in catch)',
        error: {message: error}
      })
    });

  } else { // CREATE NEW 
		   // (TO-DO use a single sequelize for both Edit and Add executions using a variable replacement object as parameters)
		   // (On first try using a replacement object there were syntax errors for ':')
		sequelize.query(`EXECUTE dbo.Schedules 
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
				executeType: 'Add',
				scheduleID: null,
				projectID: null,
				partID: schedule[0].PartID,
				notes: revisionNotes,
				employeeID: userID,
				schedule: scheduleXML,
				rowCount: null,
				errorNumber: null,
				errorMessage: null 
		}, type: sequelize.QueryTypes.SELECT})
		.then(sched => {
		console.log("execute dbo.Schedules ");
		res.json(sched);
		})
		.catch(error => {
		res.status(400).json({
			title: 'Error (in catch)',
			error: {message: error}
		})
		});
	}
}

function destroyPartSchedule(req, res) {

	const scheduleID = req.params.scheduleID;   
	const userID = req.params.userID;    

    sequelize.query(`EXECUTE dbo.Schedules 
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
			partID: null,
			notes: null,
			employeeID: userID,
			schedule: null,
			rowCount: null,
			errorNumber: null,
			errorMessage: null 
	}, type: sequelize.QueryTypes.SELECT})	
	  .then(() => {    
		 res.json({
		 message: `Schedule '${scheduleID}' has been deleted successfully`,
		})
  
	  }).catch(error => {    
		console.log(error);
		res.status(500).json({
		  title: 'destroy schedule failed',
		  error: {message: error}
		});    
	  })    
  }



module.exports = {
	indexSchedules: indexSchedules,
	getPartSchedule: getPartSchedule,
	updatePartSchedule: updatePartSchedule,
	destroyPartSchedule: destroyPartSchedule
}
