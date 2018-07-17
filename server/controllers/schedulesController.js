const sequelize = require('../db/sequelize').sequelize;

function indexSchedules(req, res) {
	const sql =
		`SELECT 
			p.ProjectID as projectID, 
			p.ProjectName as projectName, 
			pt.ProjectTypeID as projectTypeID, 
			pt.ProjectTypeName projectTypeName, 
			s.ScheduleID as scheduleID, 
			sd.PLCDate as plcDate, 
			plc.PLCStatusID as plcStatusID, 
			plc.PLCStatusName as plcStatusName
		FROM
			projects.Projects p
			LEFT JOIN projects.ProjectTypes pt ON p.ProjectTypeID = pt.ProjectTypeID
			LEFT JOIN demand.Schedules s ON p.ProjectID = s.ProjectID
			LEFT JOIN demand.SchedulesDetail sd ON s.ScheduleID = sd.ScheduleID
			LEFT JOIN projects.PLCStatus plc ON sd.PLCStatusID = plc.PLCStatusID
		ORDER BY 
			p.ProjectName`

	sequelize.query(sql, { type: sequelize.QueryTypes.SELECT})
		.then(p => {    
			res.json(p);
		})
}

module.exports = {
	indexSchedules: indexSchedules,
}

