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

module.exports = {
	indexSchedules: indexSchedules,
}

