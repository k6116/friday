import { Injectable } from '@angular/core';
import { ApiDataProjectService } from '../../../_shared/services/api-data/_index';
import { ApiDataAdvancedFilterService } from '../../../_shared/services/api-data/_index';
import { CacheService } from '../../../_shared/services/cache.service';

@Injectable()
export class AdvancedFiltersCheckboxesService {

  constructor(
    private apiDataProjectService: ApiDataProjectService,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private cacheService: CacheService
  ) { }

  onAllParentsCheck(that: any, checked: boolean) {
      console.log('all parent ckeckbox service works');

    if (checked === true) {

        // looping through all parents and check if they are already in arrFamily
        // note: index = -1 indicates the childID was not found in arrFamily
        let index = -1;
        for (let i = 0; i < that.parents.length; i++) {

          for (let j = 0; j < that.arrFamily; j++) {
            if (that.arrFamily[j] === that.parents[i].ProjectID) {
              index = j;
              break;
            }
          }

          if (index = -1) {
            that.arrFamily.push(that.parents[i].ProjectID);
          }
        }

    } else if (checked === false) {

        // looping through all parents and check if they are already in arrFamily
        for (let i = 0; i < that.parents.length; i++) {

          for (let j = 0; j < that.arrFamily.length; j++) {
            if (that.arrFamily[j] === that.parents[i].ProjectID ) {
              // found parent ID, therefore remove from arrFamily
              that.arrFamily.splice(j, 1);
            }
          }

        }

    }

  }

  onAllChildrenCheck(that: any, checked: boolean) {
console.log('service for children works');
    if (checked === true) {

        // looping through all children and check if they are already in arrFamily
        // note: index = -1 indicates the childID was not found in arrFamily
        let index = -1;
        for (let i = 0; i < that.children.length; i++) {

          for (let j = 0; j < that.arrFamily; j++) {
            if (that.arrFamily[j] === that.children[i].ProjectID) {
              index = j;
              break;
            }
          }

          // Child ID was not found, therefore add to arrFamily
          if (index = -1) {
            that.arrFamily.push(that.children[i].ProjectID);
          }
        }

    } else if (checked === false) {

        // looping through all children and check if they are already in arrFamily
        for (let i = 0; i < that.children.length; i++) {

          for (let j = 0; j < that.arrFamily.length; j++) {
            if (that.arrFamily[j] === that.children[i].ProjectID ) {
              // Child ID was found, therefore remove ID from arrFamily
              that.arrFamily.splice(j, 1);
            }
          }

        }
    }

  }

  onAllProjectTypesCheck(that: any, checked: boolean) {
    // console.log('service for project types works');
    if (checked === true) {

      that.arrTypeID = [0]; // adding zero as blank
      for (let i = 0; i < that.projectTypes.length; i++) {
        that.arrTypeID.push(that.projectTypes[i].id);
      }

    } else if (checked === false) {

      that.arrTypeID = [];
      // that.filterObject.ProjectTypesIDs = String(that.arrTypeID);

    }
  }

  onAllProjectPriorities(that: any, checked: boolean) {

    if (checked === true) {

      that.arrPriorityID = [0]; // adding zero as blank
      for (let i = 0; i < that.projectPriorities.length; i++) {
        that.arrPriorityID.push(that.projectPriorities[i].id);
      }

    } else if (checked === false) {

      that.arrPriorityID = [];
      // that.filterObject.ProjectTypesIDs = String(that.arrPriorityID);

    }
  }

  onAllProjectStatusesCheck(that: any, checked: boolean) {

    if (checked === true) {

      that.arrStatusID = [0]; // adding zero as blank
      for (let i = 0; i < that.projectStatuses.length; i++) {
        that.arrStatusID.push(that.projectStatuses[i].id);
      }

    } else if (checked === false) {

      that.arrStatusID = [];
      that.filterObject.ProjectStatusIDs = String(that.arrStatusID);

    }
  }

//   onAllProjectOwnersCheck(that: any, checked: boolean) {
//     console.log('all owners ckeckbox service works', checked);

//     if (checked === true) {
// console.log('checked is true');
// console.log('managerTeam', that.managerTeam);
// // console.log('arrOwnerEmail', that.arrOwnerEmail);

//       // that.arrOwnerEmail = [];
//       for (let i = 0; i < that.managerTeam.length; i++) {
//         that.arrOwnerEmail.push(that.managerTeam[i].EMAIL_ADDRESS);
//       }
//         that.filterObject.ProjectOwnerEmails = String(that.arrOwnerEmail);

//     } else if (checked === false) {
//       console.log('checked is false');
//       that.arrOwnerEmail = [];
//       // that.arrOwnerEmail = that.managerTeam[0].EMAIL_ADDRESS;

//     }

//   }

  // onCheckboxReset(chekboxID: any) {

  //   switch (chekboxID) {
  //     case 'ProjectTypeIDs':
  //       for (let i = 0; i < this.projectTypes.length; i++) {
  //         this.arrTypeID.push(this.projectTypes[i].id);
  //       }
  //       break;
  //     case 'ProjectStatusIDs':
  //       this.arrStatusID = [0]; // adding zero as blank
  //       for (let i = 0; i < this.projectStatuses.length; i++) {
  //         this.arrStatusID.push(this.projectStatuses[i].id);
  //       }
  //       break;
  //     case 'ProjectPriorityIDs':
  //       this.arrPriorityID = [0];  // adding zero as blank
  //       for (let i = 0; i < this.projectPriorities.length; i++) {
  //         this.arrPriorityID.push(this.projectPriorities[i].id);
  //       }
  //       break;
  //     case 'PLCStatusIDs':
  //       for (let i = 0; i < this.plcStatuses.length; i++) {
  //         this.newPLC = {
  //           index: i,
  //           PLCStatusID: this.plcStatuses[i].PLCStatusID,
  //           PLCStatusName: this.plcStatuses[i].PLCStatusName,
  //           PLCDateFrom: 'NULL',
  //           PLCDateTo: 'NULL'
  //         };
  //         this.objPLC.push(this.newPLC);
  //       }
  //       break;
  //   }

  // }

}
