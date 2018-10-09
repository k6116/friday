import { Injectable } from '@angular/core';
import { ApiDataOrgService } from '../../_shared/services/api-data/_index';

@Injectable()
export class OrgViewerService {

  org: any;

  constructor(private apiDataOrgService: ApiDataOrgService) { }

  async getOrg(supervisorEmailAddress: string) {
    // get the requested org as flat array, synchronously
    const startDate = '2018-08-01';
    const endDate = '2018-10-01';
    this.org = await this.fetchApiData(supervisorEmailAddress, startDate, endDate);

    // return early if no data returned
    if (!this.org.length) {
      return {};
    }

    // initialize top level of nested JSON org
    const orgHierarchy = {
      name: this.org[0].FullName,
      id: this.org[0].PERSON_ID,
      teamFtes: this.org[0].TotalTeamFTE,
      teamCount: this.org[0].TotalEmployeeCount,
      isExpanded: true,
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
          teamFtes: this.org[i].TotalTeamFTE,
          teamCount: this.org[i].TotalEmployeeCount
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
