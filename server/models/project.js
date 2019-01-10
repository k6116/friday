const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const Project = sequelize.define('project',
  {
    id: { type: Sequelize.INTEGER, field: 'id', primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, field: 'name' },
    description: { type: Sequelize.STRING, field: 'description' },
    projectStatusID: { type: Sequelize.INTEGER, field: 'project_status_id' },
    projectTypeID: { type: Sequelize.INTEGER, field: 'project_type_id' },
    priorityID: { type: Sequelize.INTEGER, field: 'priority_id' },
    note: { type: Sequelize.STRING, field: 'note' },
    owner: { type: Sequelize.STRING, field: 'owner'},
    createdBy: { type: Sequelize.INTEGER, field: 'created_by' },
    createdAt: { type: Sequelize.DATE, field: 'creation_date' },
    updatedBy: { type: Sequelize.INTEGER, field: 'last_updated_by' },
    updatedAt: { type: Sequelize.DATE, field: 'last_update_date' }
  },
  {
    schema: 'project',
    tableName: 'project',
    timestamps: false
  }
);

const ProjectType = sequelize.define('projectType',
  {
    id: { type: Sequelize.INTEGER, field: 'id', primaryKey: true, autoIncrement: true },
    projectTypeName: { type: Sequelize.STRING, field: 'name' },
    description: { type: Sequelize.STRING, field: 'description' }
  },
  {
    schema: 'project',
    tableName: 'project_type',
    timestamps: false
  }
);

const ProjectStatus = sequelize.define('projectStatus',
  {
    id: { type: Sequelize.INTEGER, field: 'id', primaryKey: true, autoIncrement: true },
    projectStatusName: { type: Sequelize.STRING, field: 'name' },
    description: { type: Sequelize.STRING, field: 'description' }
  },
  {
    schema: 'project',
    tableName: 'project_status',
    timestamps: false
  }
);


const ProjectPriority = sequelize.define('projectPriority',
  {
    id: { type: Sequelize.INTEGER, field: 'id', primaryKey: true, autoIncrement: true },
    priorityName: { type: Sequelize.STRING, field: 'name' },
    description: { type: Sequelize.STRING, field: 'description' }
  },
  {
    schema: 'project',
    tableName: 'priority',
    timestamps: false
  }
);


ProjectType.hasMany(Project, {foreignKey: 'id'});
Project.belongsTo(ProjectType, {foreignKey: 'projectTypeID'});

module.exports = {
  Project: Project, 
  ProjectType: ProjectType,
  ProjectStatus: ProjectStatus,
  ProjectPriority: ProjectPriority
}

