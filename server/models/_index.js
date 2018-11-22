
module.exports = {
  User: require('./user.js'),
  Part: require('./part.js').Part,
  Quote: require('./part.js').Quote,
  Supplier: require('./part.js').Supplier,
  ProjectEmployee: require('./projectEmployee.js').ProjectEmployee,
  ProjectEmployeePlanning: require('./projectEmployee.js').ProjectEmployeePlanning,
  ProjectEmployeeRoles: require('./projectEmployee.js').ProjectEmployeeRoles,
  Org: require('./org.js'),
  ClickTracking: require('./clickTracking.js'),
  JobTitle: require('./jobTitle').JobTitle,
  JobSubTitle: require('./jobTitle').JobSubTitle,
  JobTitleMap: require('./jobTitle').JobTitleMap,
  Projects: require('./project.js').Projects,
  ProjectTypes: require('./project.js').ProjectTypes,
  ProjectStatuses: require('./project.js').ProjectStatuses,
  ProjectPriorities: require('./project.js').ProjectPriorities,
  ProjectTypeDisplayFields: require('./project.js').ProjectTypeDisplayFields,
  ProjectPermissionRequests: require('./project.js').ProjectPermissionRequests,
  NCISupplyDemandExclusionList: require('./analytics.js').NCISupplyDemandExclusionList,
  Schedules: require('./schedules.js').Schedules,
  SchedulesDetail: require('./schedules.js').SchedulesDetail
}
