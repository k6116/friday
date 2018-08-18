const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');
const models = require('../models/_index')
const Treeize = require('treeize');
const moment = require('moment');


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

  function updateProjectScheduleXML(req,res) {

	// const decodedToken = token.decode(req.header('X-Token'), res);	//TO-DO fix decode
	const userID = req.params.userID;
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
			employeeID: userID, // decodedToken.userData.id,
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
				employeeID: userID, // decodedToken.userData.id,
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


function updatePartScheduleXML(req,res) {

//	const decodedToken = token.decode(req.header('X-Token'), res); //ERRORS!
	const schedule = req.body;
	const userID = req.params.userID;
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
			employeeID: userID, // decodedToken.userData.id,
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
				employeeID: userID, // decodedToken.userData.id,
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


function destroyScheduleSP(req, res) {
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

  ////////////////////////////////////////////////
  //////////// THE SEQUELIZE WAY /////////////////
  ////////////////////////////////////////////////

  function insertSchedule(req, res) {

	// get the schedule object from the request body
	// schedule object should be in the format:
	// {
	// 	projectID: null,
	// 	partID: null,
	// 	notes: null
	// }

	const scheduleData = req.body;
	const userID = req.params.userID;
  const today = new Date();

	return sequelize.transaction((t) => {
  
	  return models.Schedules
		.create(
		  {
        projectID: scheduleData.projectID,
        partID: scheduleData.partID,
        currentRevision: 1,
        notes: scheduleData.notes, 
        createdBy: userID,
        createdAt: today,
        updatedBy: userID,
        updatedAt: today
		  },
		  {
			  transaction: t
		  }
		)
		.then(insertSchedule => {
  
		  const scheduleID = insertSchedule.id;
		  console.log('created scheduleID is: ' + scheduleID);
  
		})
  
	  }).then(() => {
  
		res.json({
		  message: `The new schedule insert has been made successfully`,
		})
  
	  }).catch(error => {
  
		console.log(error);
		res.status(500).json({
		  title: 'update failed',
		  error: {message: error}
		});
  
	  })
  
  }

  function updateSchedule(req, res) {

  // This function should only be used to update the "notes". CurrentRevision should be incremented automatically

	// get the schedule object from the request body
	// schedule object should be in the format
	// {
  //  id: null, <-- this is the scheduleID
	// 	currentRevision: null,
	// 	notes: null
	// }

	const scheduleData = req.body;
	const userID = req.params.userID;
	const today = new Date();
  
	return sequelize.transaction((t) => {
  
	  return models.Schedules
		.update(
		  {
        currentRevision: scheduleData.currentRevision + 1,
        notes: scheduleData.notes, 
        updatedBy: userID,
        updatedAt: today
		  },
		  {
        where: {id: scheduleData.id},
        transaction: t
		  }
		)
		.then(updateSchedules => {
  
		  console.log('Updated Schedules')
  
		})
  
	  }).then(() => {
  
		res.json({
		  message: `The scheduleID '${scheduleData.id}' has been updated successfully`
		})
  
	  }).catch(error => {
  
		console.log(error);
		res.status(500).json({
		  title: 'update failed',
		  error: {message: error}
		});
  
	  })
  
  }

  function destroySchedule(req, res) {

    // get the schedule object from the request body
    // schedule object should be in the format
    // {
    //  id: null, <-- this is the scheduleID
    // }

    const scheduleData = req.body;
    const userID = req.params.userID;

    return sequelize.transaction((t) => {
  
      return models.Schedules
        .destroy(
          {
            where: {id: scheduleData.id},
            transaction: t
          }
        )
        .then(destroySchedule => {
  
          console.log(`ScheduleID ${scheduleData.id} destroyed`)
  
        })
  
      }).then(() => {
  
        res.json({
          message: `The scheduleID ${scheduleData.id} has been deleted successfully`,
        })
  
      }).catch(error => {
  
        console.log(error);
        res.status(500).json({
          title: 'update failed',
          error: {message: error}
        });
  
      })
  
  }

  function insertScheduleDetailBulk(req, res) {

    // There are certain constraints to be aware of:
    // - schedule should either be a set of "BuildSchedule" which includes the fields needByDate, neededQuantity, buildStatusID
    // - OR a PLC type schedule which includes the fields plcDateEstimate, plcDateCommit, plcDate, plcStatusID
    // Should not mix build and plc type schedules
    //
    // bulk schedule object should be in the format. Remember, this accepts mulitples objects in a single array for multiple inserts:
    // [{
    //   id: null,
    //   currentRevision: null,
    //   needByDate: null,
    //   neededQuantity: null,
    //   buildStatusID: null,
    //   plcDateEstimate: null,
    //   plcDateCommit: null,
    //   plcDate: null, <-- Date format can be 'YYYY-MM-DD'
    //   plcStatusID: null,
    //   notes: null, 
    // }, 
    // {...}, {...}]
  
    const scheduleData = req.body;
    const userID = req.params.userID;
    const today = new Date();

    // append a keys to format the created and updated fields
    scheduleData.forEach(schedule => {
      schedule.createdBy = userID
      schedule.createdAt = today,
      schedule.updatedBy = userID
      schedule.updatedAt = today
    });
    console.log("awlieiolwauehfliawehflaiweuh")
    console.log(scheduleData)
    return sequelize.transaction((t) => {
    
      return models.SchedulesDetail
      .bulkCreate(
        scheduleData,
        {
          transaction: t
        }
      )
      .then(insertScheduleDetailBulk => {

        console.log('bulk creation for scheduleID scheduleData.id');
    
      })
    
      }).then(() => {
    
      res.json({
        message: `The bulk schedule insert has been made successfully`,
      })
    
      }).catch(error => {
    
      console.log(error);
      res.status(500).json({
        title: 'update failed',
        error: {message: error}
      });
    
      })
    
    }
  
    // function updateSchedule(req, res) {
  
    // // This function should only be used to update the "notes". CurrentRevision should be incremented automatically
  
    // // get the schedule object from the request body
    // // schedule object should be in the format
    // // {
    // //  id: null, <-- this is the scheduleID
    // // 	currentRevision: null,
    // // 	notes: null
    // // }
  
    // const scheduleData = req.body;
    // const userID = req.params.userID;
    // const today = new Date();
    
    // return sequelize.transaction((t) => {
    
    //   return models.Schedules
    //   .update(
    //     {
    //       currentRevision: scheduleData.currentRevision + 1,
    //       notes: scheduleData.notes, 
    //       updatedBy: userID,
    //       updatedAt: today
    //     },
    //     {
    //       where: {id: scheduleData.id},
    //       transaction: t
    //     }
    //   )
    //   .then(updateSchedules => {
    
    //     console.log('Updated Schedules')
    
    //   })
    
    //   }).then(() => {
    
    //   res.json({
    //     message: `The scheduleID '${scheduleData.id}' has been updated successfully`
    //   })
    
    //   }).catch(error => {
    
    //   console.log(error);
    //   res.status(500).json({
    //     title: 'update failed',
    //     error: {message: error}
    //   });
    
    //   })
    
    // }
  
    // function destroySchedule(req, res) {
  
    //   // get the schedule object from the request body
    //   // schedule object should be in the format
    //   // {
    //   //  id: null, <-- this is the scheduleID
    //   // }
  
    //   const scheduleData = req.body;
    //   const userID = req.params.userID;
  
    //   return sequelize.transaction((t) => {
    
    //     return models.Schedules
    //       .destroy(
    //         {
    //           where: {id: scheduleData.id},
    //           transaction: t
    //         }
    //       )
    //       .then(destroySchedule => {
    
    //         console.log(`ScheduleID ${scheduleData.id} destroyed`)
    
    //       })
    
    //     }).then(() => {
    
    //       res.json({
    //         message: `The scheduleID ${scheduleData.id} has been deleted successfully`,
    //       })
    
    //     }).catch(error => {
    
    //       console.log(error);
    //       res.status(500).json({
    //         title: 'update failed',
    //         error: {message: error}
    //       });
    
    //     })
    
    // }

module.exports = {
	indexProjectSchedule: indexProjectSchedule,
	indexPartSchedule: indexPartSchedule,
	updateProjectScheduleXML: updateProjectScheduleXML,
	updatePartScheduleXML: updatePartScheduleXML,	
  destroyScheduleSP: destroyScheduleSP,
  insertSchedule: insertSchedule,
  updateSchedule: updateSchedule,
  destroySchedule: destroySchedule,
  insertScheduleDetailBulk: insertScheduleDetailBulk
}
