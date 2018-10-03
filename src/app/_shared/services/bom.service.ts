import { Injectable } from '@angular/core';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';

@Injectable()
export class BomService {

  bill: any;  // for storing the selected bill as flat array

  constructor(private apiDataBomService: ApiDataBomService) { }

  async getBom(selectedID: number, selectedEntity: string) {

    // get the selected BOM as flat array, synchronously
    this.bill = await this.fetchApiData(selectedID, selectedEntity);

    if (!this.bill.length) {
      return {};
    }

    // initialize top level of nested JSON BOM
    const billHierarchy = {
      name: this.bill[0].ParentName.length > 19 ? `${this.bill[0].ParentName.slice(0, 20)}...` : this.bill[0].ParentName,
      longName: this.bill[0].ParentName,
      id: this.bill[0].ParentID,
      qty: 1,
      dept: this.bill[0].ParentDepartment,
      type: this.bill[0].ParentType,
      entity: this.bill[0].ParentEntity,
      isExpanded: true,
      children: {}
    };

    // recursively parse the BOM structure, synchronously
    const jsonBom = await this.bomTraverse(0, 1);

    // add the recursive output as the 'children' property of the top level BOM JSON
    billHierarchy.children = jsonBom.nextLvData;

    return billHierarchy;
  }

  fetchApiData(selectedID: number, selectedEntity: string) {
    // get the data, but return a promise so we can await the data in the parent function
    return this.apiDataBomService.showSingleBom(selectedID, selectedEntity).toPromise();
  }

  bomTraverse(i: number, lv: number) {
    // i = index of the array to start traversing (usu 0)
    // lv - initial level of the BOM (usu 1)
    const children = [];
    while (i < this.bill.length) {
      if (this.bill[i].Level === lv) {
        // traverse down and collect all the siblings in this level
        let newNode: any;
        newNode = {
          name: this.bill[i].ChildName.length > 19 ? `${this.bill[i].ChildName.slice(0, 20)}...` : this.bill[i].ChildName,
          longName: this.bill[i].ChildName,
          qty: this.bill[i].QtyPer,
          id: this.bill[i].ChildID,
          dept: this.bill[i].ChildDepartment,
          type: this.bill[i].ChildType,
          entity: this.bill[i].ChildEntity
        };
        children.push(newNode);
        i++;
      } else if (this.bill[i].Level > lv) {
        // if the next record is a child, recurse
        // when we return to this level, continue traversing from the farthest-reached index
        const output = this.bomTraverse(i, lv + 1);
        const lastIndex = children.length - 1;
        children[lastIndex].children = output.nextLvData;
        i = Number(output.nextRow);
      } else if (this.bill[i].Level < lv) {
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
  } // end bomTraverse

}
