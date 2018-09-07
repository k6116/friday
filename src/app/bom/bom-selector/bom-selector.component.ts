import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

declare var $: any;
declare const Bloodhound;

@Component({
  selector: 'app-bom-selector',
  templateUrl: './bom-selector.component.html',
  styleUrls: ['./bom-selector.component.css', '../../_shared/styles/common.css']
})
export class BomSelectorComponent implements OnInit {

  @Output() selectedBom = new EventEmitter<any>();

  bill: any;  // for storing the selected bill as flat array
  billHierarchy: any; // for storing the selected bill as nested JSON
  bomJson: any;  // for passing a nested bill JSON structure to bom-drawer

  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
    // get list of bills for typeahead.js
    this.apiDataBomService.index().subscribe( res => {

      // initialize bloodhound suggestion engine with data
      const bh = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('PartOrProjectName'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: res  // flat array of bills from api data service
      });

      // initialize typeahead using jquery
      $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'bill-names',
        displayKey: 'PartOrProjectName',  // use this to select the field name in the query you want to display
        source: bh
      })
      .bind('typeahead:selected', (event, selection) => {
        // once something in the typeahead is selected, trigger this function
        this.onBomSelect(selection);
      });

    });
  }

  onBomSelect(selectedBom: any) {
    // parse selected BOM info from bom-selector child component
    const selectedName = selectedBom.PartOrProjectName;
    const selectedEntity = selectedBom.EntityType;
    const selectedID = selectedEntity === 'Project' ? selectedBom.ParentProjectID : selectedBom.ParentPartID;

    // get the selected BOM as flat array
    const bomSubscription = this.apiDataBomService.showSingleBom(selectedID, selectedEntity).subscribe( res => {

      this.bill = res;
      bomSubscription.unsubscribe();

      // initialize bomtree
      this.billHierarchy = {
        value: this.bill[0].ParentName.length > 19 ? `${this.bill[0].ParentName.slice(0, 20)}...` : this.bill[0].ParentName,
        longName: this.bill[0].ParentName,
        id: this.bill[0].ParentID,
        qty: 1,
        dept: this.bill[0].ParentDepartment,
        type: this.bill[0].ParentType,
        entity: this.bill[0].ParentEntity
      };

      // using async/await to wait for BOM parser to finish
      const bomSetup = async () => {
        // recursively parse the BOM structure
        const jsonBom = await this.bomTraverse(0, 1);

        // add the recursive output as 'children' property of the tree nodeStructure
        this.billHierarchy.children = jsonBom.nextLvData;

        this.selectedBom.emit(this.billHierarchy);
      };

      // execute our async function
      bomSetup();
    });
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
          value: this.bill[i].ChildName.length > 19 ? `${this.bill[i].ChildName.slice(0, 20)}...` : this.bill[i].ChildName,
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
