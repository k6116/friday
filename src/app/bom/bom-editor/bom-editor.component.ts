import { Component, OnInit, ViewChild } from '@angular/core';
import { TreeModel } from 'ng2-tree';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-bom-editor',
  templateUrl: './bom-editor.component.html',
  styleUrls: ['./bom-editor.component.css', '../../_shared/styles/common.css']
})
export class BomEditorComponent implements OnInit {

  @ViewChild('treeComponent') treeComponent;

  selectedBom: any;
  bill: any;  // for storing the selected bill as flat array
  bomTree: any; // for storing the selected bill as tree JSON
  showBom = false;

  // for showing details when clicking a ndoe
  showDetails = false;
  details: any;

  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
  }

  onBomSelect(selection: any) {
    this.showBom = false;
    this.showDetails = false;

    // parse selected BOM info from bom-selector child component
    this.selectedBom = selection;
    const selectedName = selection.PartOrProjectName;
    const selectedEntity = selection.EntityType;
    const selectedID = selectedEntity === 'Project' ? selection.ParentProjectID : selection.ParentPartID;

    // get the selected BOM as flat array
    const bomSubscription = this.apiDataBomService.showSingleBom(selectedID, selectedEntity).subscribe( res => {
      this.bill = res;
      bomSubscription.unsubscribe();
      // console.log(this.bill);

      // initialize bomtree
      this.bomTree = {
        value: this.bill[0].ParentName,
        id: this.bill[0].ParentID,
        type: this.bill[0].ParentEntity
      };

      // recursively parse the BOM structure
      const blaa = this.bomTraverse(0, 1);
      this.bomTree.children = blaa[0];
      this.showBom = true;
      // console.log(this.bomTree);
    });
  }

  bomTraverse(i: number, lv: number) {
    // i = index of the array to start traversing (usu 0)
    // lv - initial level of the BOM (usu 1)
    const children = [];
    while (i < this.bill.length) {
      if (this.bill[i].Level === lv) {
        // traverse down and collect all the siblings in this level
        children.push({
          value: this.bill[i].ChildName,
          id: this.bill[i].ChildID,
          type: this.bill[i].ChildEntity
        });
        i++;
      } else if (this.bill[i].Level > lv) {
        // if the next record is a child, recurse
        // when we return to this level, continue traversing from the farthest-reached index
        const output = this.bomTraverse(i, lv + 1);
        children[children.length - 1].children = output[0];
        i = Number(output[1]);
      } else if (this.bill[i].Level < lv) {
        // if the next record is a parent, return the complete set of nested children
        // and the next value to continue traversing at
        return [children, i];
      }
    } // end while
    return [children, i];
  } // end bomTraverse

  onNodeSelect(clickedItem: any) {
    this.showDetails = false;
    // when a tree node is selected, toggle node collapse
    const oopNodeController = this.treeComponent.getControllerByNodeId(clickedItem.node.id);
    oopNodeController.unselect();
    if (oopNodeController.isCollapsed()) {
      oopNodeController.expand();
    }

    // fetch the data
    if (clickedItem.node.type === 'Project') {
      const detailsSub = this.apiDataBomService.showProjectInfo(clickedItem.node.id).subscribe( res => {
        this.details = res[0];
        this.details.entity = 'Project';
        detailsSub.unsubscribe();
        this.showDetails = true;
      });
    } else {
      const detailsSub = this.apiDataBomService.showPartInfo(clickedItem.node.id).subscribe( res => {
        this.details = res[0];
        this.details.entity = 'Part';
        detailsSub.unsubscribe();
        this.showDetails = true;
      });
    }
  }

}
