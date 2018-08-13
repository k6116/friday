const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');
const Treeize = require('treeize');
const token = require('../token/token');


function indexProjectSchedule(req, res) {

	const projectID = req.params.projectID;
	const sql =
		`SELECT 		
			f.ScheduleID,	
			f.ProjectID,				
			f.CurrentRevision,
			f.notes as 'RevisionNotes', 
			convert(varchar(10), d.PLCDate, 120) as 'PLCDate', 	
			d.PLCStatusID,
			d.Notes,
			DeleteRow = 0
		FROM
			vSchedulesForm f 
		INNER JOIN 
			vSchedulesDetail d on d.scheduleid = f.scheduleid
		WHERE
			f.ProjectID = '${projectID}'
		ORDER BY 
			NeedByDate`

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
		.then(schedule => {		
			res.json(schedule);
		})
}

  function updateProjectSchedule(req,res) {

 	const decodedToken = token.decode(req.header('X-Token'), res);
	const revisionNotes = req.params.revisionNotes;
	
	const schedule = req.body;

	var scheduleXML = `<Schedules>`;
	schedule.forEach(element => {
		   if (element.DeleteRow === false || element.DeleteRow === 0) {
			scheduleXML = scheduleXML + 
			`<Schedule 
			PLCDate='${element.PLCDate}'		
			PLCStatusID='${element.PLCStatusID == null ? '' : element.PLCStatusID}' 
			Notes='${element.Notes}' 
		    />` 	
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
			projectID: schedule[0].ProjectID,
			partID: null,
			notes: revisionNotes,
			employeeID: decodedToken.userData.id,
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
		   // (TO-DO: Mike - use a single sequelize for both Edit and Add executions using a variable replacement object as parameters)
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
				projectID: schedule[0].ProjectID,
				partID: null,
				notes: revisionNotes,
				employeeID: decodedToken.userData.id,
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


function indexPartSchedule(req, res) {
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

	const decodedToken = token.decode(req.header('X-Token'), res); //ERRORS!
	const schedule = req.body;
//	const userID = req.params.userID;
	const revisionNotes = req.params.revisionNotes;

	var scheduleXML = `<Schedules>`;
	schedule.forEach(element => {
		   if (element.DeleteRow === false || element.DeleteRow === 0) {
			scheduleXML = scheduleXML + 
			`<Schedule 
			NeedByDate='${element.NeedByDate}' 
			NeededQuantity='${element.NeededQuantity}' 
			BuildStatusID='${element.BuildStatusID == null ? '' : element.BuildStatusID}' 
			Notes='${element.Notes}' 
		    />` 	
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
			employeeID: decodedToken.userData.id,
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
				employeeID: decodedToken.userData.id,
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


function destroySchedule(req, res) {
	const decodedToken = token.decode(req.header('X-Token'), res);
	const scheduleID = req.params.scheduleID;   

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
			employeeID: decodedToken.userData.id,
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
	indexProjectSchedule: indexProjectSchedule,
	indexPartSchedule: indexPartSchedule,
	updateProjectSchedule: updateProjectSchedule,
	updatePartSchedule: updatePartSchedule,	
	destroySchedule: destroySchedule
}
