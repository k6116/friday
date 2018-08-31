export class JobTitleModel {
    JobTitleID: number;
    JobTitleName: string;
    JobSubTitleID: number;
    JobSubTitleName: string;
    employees: EmployeesArray[];
}

export class EmployeesArray {
    isJobTitle: boolean;
}

// const userFTEs: UserFTEs[] = [
//     {projectID: 100, projectName: 'Armstrong', allocations: [
//         {month: new Date('2016-08-01T12:00:00'), fte: 1},
//         {month: new Date('2016-09-01T12:00:00'), fte: 0.9},
//         {month: new Date('2016-10-01T12:00:00'), fte: 0.8},
//         {month: new Date('2016-11-01T12:00:00'), fte: 0.7},
//         {month: new Date('2016-12-01T12:00:00'), fte: 0.6},
//         {month: new Date('2017-01-01T12:00:00'), fte: 0.5},
//         {month: new Date('2017-02-01T12:00:00'), fte: 0.4},
//         {month: new Date('2017-03-01T12:00:00'), fte: 0.3},
//         {month: new Date('2017-04-01T12:00:00'), fte: 0.2},
//         {month: new Date('2017-05-01T12:00:00'), fte: 0.1},
//         {month: new Date('2017-06-01T12:00:00'), fte: 0},
//         {month: new Date('2017-07-01T12:00:00'), fte: 1},
//         {month: new Date('2017-08-01T12:00:00'), fte: 1},
//         {month: new Date('2017-09-01T12:00:00'), fte: 0.9},
//         {month: new Date('2017-10-01T12:00:00'), fte: 0.8},
//         {month: new Date('2017-11-01T12:00:00'), fte: 0.7},
//         {month: new Date('2017-12-01T12:00:00'), fte: 0.6},
//         {month: new Date('2018-01-01T12:00:00'), fte: 0.5},
//         {month: new Date('2018-02-01T12:00:00'), fte: 0.4},
//         {month: new Date('2018-03-01T12:00:00'), fte: 0.3},
//         {month: new Date('2018-04-01T12:00:00'), fte: 0.2},
//         {month: new Date('2018-05-01T12:00:00'), fte: 0.1},
//         {month: new Date('2018-06-01T12:00:00'), fte: 0},
//         {month: new Date('2018-07-01T12:00:00'), fte: 1}
//     ]},
//     {projectID: 101, projectName: 'Brewer', allocations: [
//         {month: new Date('2016-08-01T12:00:00'), fte: 1},
//         {month: new Date('2016-09-01T12:00:00'), fte: 0.9},
//         {month: new Date('2016-10-01T12:00:00'), fte: 0.8},
//         {month: new Date('2016-11-01T12:00:00'), fte: 0.7},
//         {month: new Date('2016-12-01T12:00:00'), fte: 0.6},
//         {month: new Date('2017-01-01T12:00:00'), fte: 0.5},
//         {month: new Date('2017-02-01T12:00:00'), fte: 0.4},
//         {month: new Date('2017-03-01T12:00:00'), fte: 0.3},
//         {month: new Date('2017-04-01T12:00:00'), fte: 0.2},
//         {month: new Date('2017-05-01T12:00:00'), fte: 0.1},
//         {month: new Date('2017-06-01T12:00:00'), fte: 0},
//         {month: new Date('2017-07-01T12:00:00'), fte: 1},
//         {month: new Date('2017-08-01T12:00:00'), fte: 1},
//         {month: new Date('2017-09-01T12:00:00'), fte: 0.9},
//         {month: new Date('2017-10-01T12:00:00'), fte: 0.8},
//         {month: new Date('2017-11-01T12:00:00'), fte: 0.7},
//         {month: new Date('2017-12-01T12:00:00'), fte: 0.6},
//         {month: new Date('2018-01-01T12:00:00'), fte: 0.5},
//         {month: new Date('2018-02-01T12:00:00'), fte: 0.4},
//         {month: new Date('2018-03-01T12:00:00'), fte: 0.3},
//         {month: new Date('2018-04-01T12:00:00'), fte: 0.2},
//         {month: new Date('2018-05-01T12:00:00'), fte: 0.1},
//         {month: new Date('2018-06-01T12:00:00'), fte: 0},
//         {month: new Date('2018-07-01T12:00:00'), fte: 1}
//     ]}
// ];

// export {userFTEs as fteTestData};
