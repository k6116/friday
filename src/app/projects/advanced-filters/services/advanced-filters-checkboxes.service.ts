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

    if (checked === true) {

        // looping through all parents and check if they are already in arrFamily
        // note: index = -1 indicates the childID was not found in arrFamily

        let index = -1;
        for (let i = 0; i < that.parents.length; i++) {

          for (let j = 0; j < that.arrFamily.length; j++) {
            if (that.arrFamily[j] === that.parents[i].ProjectID) {
              index = j;
              break;
            }
          }

          if (index === -1) {
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

    if (checked === true) {

        // looping through all children and check if they are already in arrFamily
        // note: index = -1 indicates the childID was not found in arrFamily
console.log('children:', that.children);
        let index = -1;
        for (let i = 0; i < that.children.length; i++) {

          for (let j = 0; j < that.arrFamily.length; j++) {
            console.log('arrFam[j] = ' + that.arrFamily[j] + ' | children[i].ProjectID = ' + that.children[i].ProjectID)
            if (that.arrFamily[j] === that.children[i].ProjectID) {
              index = j;
              console.log('SAME', index)

              break;
            }
          }

          // Child ID was not found, therefore add to arrFamily
          if (index === -1) {
            console.log('pushing:', that.children[i].ProjectID);
            that.arrFamily.push(that.children[i].ProjectID);
          }
        }
        console.log('WTF', that.arrFamily);

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

    if (checked === true) {

      that.arrTypeID = [];
      for (let i = 0; i < that.projectTypes.length; i++) {
        that.arrTypeID.push(that.projectTypes[i].id);
      }

    } else if (checked === false) {

      that.arrTypeID = [];

    }
  }

  onAllProjectPriorities(that: any, checked: boolean) {

    if (checked === true) {

      that.arrPriorityID = [];
      for (let i = 0; i < that.projectPriorities.length; i++) {
        that.arrPriorityID.push(that.projectPriorities[i].id);
      }

    } else if (checked === false) {

      that.arrPriorityID = [];

    }
  }

  onAllProjectStatusesCheck(that: any, checked: boolean) {

    if (checked === true) {

      that.arrStatusID = [];
      for (let i = 0; i < that.projectStatuses.length; i++) {
        that.arrStatusID.push(that.projectStatuses[i].id);
      }

    } else if (checked === false) {

      that.arrStatusID = [];
      that.filterObject.ProjectStatusIDs = String(that.arrStatusID);

    }
  }

}
