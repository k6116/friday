const sequelize = require('../db/sequelize').sequelize;

function indexSchedules(req, res) {
	const sql =
		`SELECT 
			p.ProjectID, p.ProjectName, pt.ProjectTypeID, pt.ProjectTypeName, s.ScheduleID, sd.PLCDate, plc.PLCStatusID, plc.PLCStatusName
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

