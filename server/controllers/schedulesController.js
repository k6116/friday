const sequelize = require('../db/sequelize').sequelize;
const Sequelize = require('sequelize');
const models = require('../models/_index')
const Treeize = require('treeize');
const token = require('../token/token');
const moment = require('moment');
var dateFormat = require('dateformat');


function indexProjectSchedule(req, res) {

	const projectID = req.params.projectID;
	const sql =
		`SELECT 		
			f.ScheduleID,	
			f.ProjectID,				
			f.CurrentRevision,
			f.notes as 'RevisionNotes', 
			convert(char(10), d.PLCDate, 126) as 'PLCDate', 	
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
			PLCDate`

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
		.then(schedule => {		
			// the date conversion for PLCDate as YYYY-MM-DD is lost with this sequelize function. Formatting is done in the .ts file
			res.json(schedule);
		})
}

function showBuildSchedule(req, res) {

	const projectID = req.params.projectID;
	models.Schedules.findAll({
		attributes: [
			'id',
			'projectID',
			'currentRevision',
			'notes',
			'schedulesDetails.needByDate',
			'schedulesDetails.neededQuantity',
			'schedulesDetails.buildStatusID'
			// sequelize added an 's' to the end of the schedulesDetail table name in its aliasing.  No clue why
		],
		include: [{
			model: models.SchedulesDetail,
			attributes: []
			// empty attributes trick to prevent having a fully-qualified property name (ie, field = suppliers.supplierName instead of supplierName)
      // see https://github.com/sequelize/sequelize/issues/7605
		}],
		where: { projectID: projectID },
		raw: true
	})
	.then(schedule => {		
		res.json(schedule);
	})
}

function indexBuildStatus(req, res) {
	// returns list of build schedule types (ie, Breadboard, Proto 1, etc) from db
	models.BuildStatus.findAll()
	.then(schedule => {
		res.json(schedule);
	})
}

function updateBuildScheduleNew(req, res) {
	const decodedToken = token.decode(req.header('X-Token'), res);
	const userID = decodedToken.userData.id;
  const buildScheduleForm = req.body.buildScheduleArray;
  const insertSchedules = [];
	const updateSchedules = [];
	const insertSchedulesDetails = [];
	const updateSchedulesDetails = [];

  // if order is missing matOrderID, then it is new.  Otherwise, it is an update (because the frontend has already parsed out the no-changes records)
  buildScheduleForm.forEach( schedule => {
    if (schedule.scheduleID === null) {
      insertSchedules.push({
        projectID: schedule.projectID,
				currentRevision: schedule.currentRevision,
				notes: schedule.notes,
        createdBy: userID,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
			});
			
			insertSchedulesDetails.push({
				currentRevision: schedule.currentRevision,
				needByDate: schedule.needByDate,
				neededQuantity: schedule.neededQuantity,
				buildStatusID: schedule.buildStatusID,
				createdBy: userID,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
			});
    } else {
      updateSchedules.push({
				scheduleID: schedule.scheduleID,
        projectID: schedule.projectID,
				currentRevision: schedule.currentRevision,
				notes: schedule.notes,
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
			});
			
			updateSchedulesDetails.push({
				scheduleID: schedule.scheduleID,
				currentRevision: schedule.currentRevision,
				needByDate: schedule.needByDate,
				neededQuantity: schedule.neededQuantity,
				buildStatusID: schedule.buildStatusID,
        updatedBy: userID,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
			});
    }
  });

  console.log('done parsing insertSchedules');
  console.log(insertSchedules);
  console.log('done parsing insertSchedulesDetails');
	console.log(insertSchedulesDetails);
	console.log('done parsing updateSchedules');
  console.log(updateSchedules);
  console.log('done parsing updateSchedulesDetails');
  console.log(updateSchedulesDetails);

  return sequelize.transaction( (t) => {
    // first, insert records into Schedules
    return models.Schedules.bulkCreate(
      insertSchedules,
      {transaction: t}
    )
    .then( insertedRecords => {
      console.log(`${insertedRecords.length} buildSchedule records inserted`);

			// also insert into SchedulesDetail
			return models.SchedulesDetail.bulkCreate(
				insertSchedulesDetails,
				{transaction: t}
			)
			.then (insertedRecords => {
				console.log(`${insertedRecords.length} buildScheduleDetails records inserted`);

				// then build an array of promises for updates to make to
				let promises = [];
				for (let i = 0; i < updateSchedules.length; i++) {
					let newPromise = models.Schedules.update(
					{
						scheduleID: updateSchedules[i].scheduleID,
						projectID: updateSchedules[i].projectID,
						currentRevision: updateSchedules[i].currentRevision,
						notes: updateSchedules[i].notes,
						updatedBy: updateSchedules[i].updatedBy,
						updatedAt: updateSchedules[i].updatedAt
					},
					{
						where: { scheduleID: updateSchedules[i].scheduleID },
						transaction: t
					});
					promises.push(newPromise);
				};
				// then execute all the promises to update the quote records
				return Promise.all(promises)
				.then( updatedRecords => {
					console.log(`${updatedRecords.length} buildSchedule records updated`);

					// then build an array of promises for updates to make to
					let promises = [];
					for (let i = 0; i < updateSchedulesDetails.length; i++) {
						let newPromise = models.SchedulesDetail.update(
						{
							scheduleID: updateSchedulesDetails[i].scheduleID,
							currentRevision: updateSchedulesDetails[i].currentRevision,
							needByDate: updateSchedulesDetails[i].needByDate,
							neededQuantity: updateSchedulesDetails[i].neededQuantity,
							updatedBy: updateSchedulesDetails[i].updatedBy,
							updatedAt: updateSchedulesDetails[i].updatedAt
						},
						{
							where: {
								scheduleID: updateSchedulesDetails[i].scheduleID,
								buildStatusID: updateSchedulesDetails[i].buildStatusID
							},
							transaction: t
						});
						promises.push(newPromise);
					};
					// then execute all the promises to update the quote records
					return Promise.all(promises);
				});
			});
      
    })
    .then( updatedRecords => {
      console.log(`${updatedRecords.length} buildScheduleDetails records updated`)
    });
  }) // end transaction
  .then(() => {
    res.json({
      message: `Build Schedule saved!`
    })
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: 'build schedule save failed',
      error: error
    });
  });
}

  function updateProjectScheduleXML(req,res) {

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
			convert(char(10), d.needbydate, 126) as 'NeedByDate', 
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
  //  scheduleID: null, <-- this is the scheduleID
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
        where: {id: scheduleData.scheduleID},
        transaction: t
		  }
		)
		.then(updateSchedules => {
  
		  console.log('Updated Schedules')
  
		})
  
	  }).then(() => {
  
		res.json({
		  message: `The scheduleID '${scheduleData.scheduleID}' has been updated successfully`
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

		// If foreign keys exists in the SchedulesDetail table, delete those first

    // get the schedule object from the request body
    // schedule object should be in the format
    // {
    //  scheduleID: null
    // }

    const scheduleData = req.body;
    const userID = req.params.userID;

    return sequelize.transaction((t) => {

			return models.SchedulesDetail
				.destroy({
					where: {scheduleID: scheduleData.scheduleID},
					transaction: t
				}).then(destroySchedulesDetail => {

					return models.Schedules
						.destroy({
							where: {id: scheduleData.scheduleID},
							transaction: t
						}).then(destroySchedule => {
			
							console.log(`ScheduleID ${scheduleData.scheduleID} destroyed`)
			
						})

				})
  
      }).then(() => {
  
        res.json({
          message: `The scheduleID ${scheduleData.scheduleID} has been deleted successfully`,
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
    // bulk schedule object should be in the format. Remember, this accepts mulitple objects in a single array for multiple inserts:
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
  
  function updateScheduleDetailBulk(req, res) {
  
    // bulk update schedule object should be in the format. Remember, this accepts mulitple objects in a single array for multiple inserts:
    // [{
    //   scheduleID: null,
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
		const scheduleID = req.params.scheduleID
		const userID = req.params.userID;
		const today = new Date();

		// append a keys to format the created and updated fields
		scheduleData.forEach(schedule => {
			schedule.createdBy = userID
      schedule.createdAt = today,
      schedule.updatedBy = userID
      schedule.updatedAt = today
			});

			console.log('Schedule Data', scheduleData)

		return sequelize.transaction((t) => {

			// delete all scheduleID and insert new ones as replacements
			return models.SchedulesDetail
				.destroy({
					where: {
						scheduleID: scheduleID
					},
					transaction: t
				}).then( deletedRows => {
					
				return models.SchedulesDetail
					.bulkCreate(
						scheduleData,
						{
							transaction: t
						}).then(updateScheduleDetailBulk => {

							console.log(`bulk update for scheduleID ${scheduleID}`);
				
						})
			
				})
				
		}).then(() => {

			res.json({
				message: 'Your updated schedules have been successfully saved!'
			})

		}).catch(error => {

			// console.log(error);
			res.status(500).json({
				message: 'update failed',
				error: error
			});

		})
    
	}


// TEMP CODE: project schedule data for x-range chart (gantt)
// TO-DO BILL: combine with index function at the top if possible
function getProjectSchedule(req, res) {

	const projectID = req.params.projectID;

	const sql =
		`SELECT
			T1.CreationDate,
			T3.PLCDateEstimate,
			T3.PLCDateCommit,
			T3.PLCDate,
			T4.PLCStatusName,
			T4.[Description],
			T4.PLCSequence
		FROM
			projects.Projects T1
			INNER JOIN demand.Schedules T2 ON T1.ProjectID = T2.ProjectID
			INNER JOIN demand.SchedulesDetail T3 ON T2.ScheduleID = T3.ScheduleID
			INNER JOIN projects.PLCStatus T4 ON T3.PLCStatusID = T4.PLCStatusID
		WHERE
			T1.ProjectID = ${projectID}
		ORDER BY
			PLCSequence`

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
		.then(schedule => {		
			res.json(schedule);
		})
}

function getPLCList(req, res) {

	const sql =
		`SELECT
			*
		FROM
			projects.PLCStatus
		ORDER BY
			PLCSequence`

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
		.then(schedule => {		
			res.json(schedule);
		})
}

  
module.exports = {
	showBuildSchedule: showBuildSchedule,
	indexBuildStatus: indexBuildStatus,
	updateBuildScheduleNew: updateBuildScheduleNew,
	indexProjectSchedule: indexProjectSchedule,
	indexPartSchedule: indexPartSchedule,
	updateProjectScheduleXML: updateProjectScheduleXML,
	updatePartScheduleXML: updatePartScheduleXML,	
  destroyScheduleSP: destroyScheduleSP,
  insertSchedule: insertSchedule,
  updateSchedule: updateSchedule,
  destroySchedule: destroySchedule,
	insertScheduleDetailBulk: insertScheduleDetailBulk,
	updateScheduleDetailBulk: updateScheduleDetailBulk,
	getProjectSchedule: getProjectSchedule,
	getPLCList: getPLCList
}
