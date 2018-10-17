import { Injectable } from '@angular/core';
import { ApiDataOrgService } from '../../_shared/services/api-data/_index';
import * as moment from 'moment';

@Injectable()
export class OrgViewerService {

  org: any;
  managerChain;
  monthsBetween: number;

  constructor(private apiDataOrgService: ApiDataOrgService) { }

  async getOrg(supervisorEmailAddress: string, startDate: string, endDate: string) {
    // get the requested org as flat array, synchronously
    const queryEmail = 'ron_nersesian@keysight.com';
    this.org = await this.fetchApiData(queryEmail, startDate, endDate);
    this.monthsBetween = moment(endDate).diff(moment(startDate), 'months');

    // return early if no data returned
    if (!this.org.length) {
      return {};
    }

    // build list of supervisors who are upstream from user's manager
    const manager = this.org.filter( record => record.EMAIL_ADDRESS === supervisorEmailAddress)[0];
    this.managerChain = await this.buildManagerChain(manager.PERSON_ID);

    // initialize top level of nested JSON org
    const orgHierarchy = {
      name: this.org[0].FullName,
      id: this.org[0].PERSON_ID,
      email: this.org[0].EMAIL_ADDRESS,
      teamFtes: this.org[0].TotalTeamFTE / this.monthsBetween, // avg FTEs/month over the number of months in range
      teamCount: this.org[0].TotalEmployeeCount,
      defaultCollapsed: false,
      children: {}
    };
    this.org = this.org.slice(1); // remove the first row, since we don't need it anymore

    // recursively parse the org structure, synchronously
    const jsonOrg = await this.orgTraverse(0, 2);

    // add the recursive output as the 'children' property of the top level org JSON
    orgHierarchy.children = jsonOrg.nextLvData;
    return orgHierarchy;
  }

  fetchApiData(supervisorEmailAddress: string, startDate: string, endDate: string) {
    // get the data, but return a promise so we can await the data in the parent function
    return this.apiDataOrgService.getOrgFtes(supervisorEmailAddress, startDate, endDate).toPromise();
  }

  buildManagerChain(personID: number) {
    // recursively build an array of manager IDs from the user's manager up to the top level (Ron)
    const relationship = this.org.filter( record => record.PERSON_ID === personID)[0];
    if (relationship.Level === 1) {
      // we've made it to Ron
      return relationship.PERSON_ID;
    } else {
      let nextManager = [];
      // concatenating the recursive output first creates a list of manager IDs where 0 index is Ron and last index is the user's boss
      nextManager = nextManager.concat(this.buildManagerChain(relationship.SUPERVISOR_ID));
      nextManager = nextManager.concat(personID);
      return nextManager;
    }
  }

  orgTraverse(i: number, lv: number) {
    // i = index of the array to start traversing (usu 0)
    // lv - initial level of the org structure (usu 2)
    const children = [];
    while (i < this.org.length) {
      if (this.org[i].Level === lv) {
        // traverse down and collect all the siblings in this level
        let newNode: any;
        newNode = {
          name: this.org[i].FullName,
          id: this.org[i].PERSON_ID,
          email: this.org[i].EMAIL_ADDRESS,
          teamFtes: this.org[i].TotalTeamFTE / this.monthsBetween,
          teamCount: this.org[i].TotalEmployeeCount,
          defaultCollapsed: this.managerChain.find(managerID => managerID === this.org[i].PERSON_ID) ? false : true
        };
        children.push(newNode);
        i++;
      } else if (this.org[i].Level > lv) {
        // if the next record is a child, recurse
        // when we return to this level, continue traversing from the farthest-reached index
        const output = this.orgTraverse(i, lv + 1);
        const lastIndex = children.length - 1;
        children[lastIndex].children = output.nextLvData;
        i = Number(output.nextRow);
      } else if (this.org[i].Level < lv) {
        // if the next record is a parent, return the complete set of nested children
        // and the next value to continue traversing at
        return {
          nextRow: i,
          nextLvData: children
        };
      }
    } // end while
    return {
      nextRow: i,
      nextLvData: children
    };
  }

}
