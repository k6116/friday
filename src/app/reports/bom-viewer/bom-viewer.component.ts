import { Component, OnInit, ViewChild } from '@angular/core';
import { TreeModel } from 'ng2-tree';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-bom-viewer',
  templateUrl: './bom-viewer.component.html',
  styleUrls: ['./bom-viewer.component.css', '../../_shared/styles/common.css']
})
export class BomViewerComponent implements OnInit {

  @ViewChild('treeComponent') treeComponent;

  billList: any;  // for getting the list of bills in drop-down
  billListSub: Subscription;
  bill: any;  // for storing the selected bill as flat array
  bomTree: any; // for storing the selected bill as tree JSON
  showBom = false;

  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
    // get list of bills in drop-down
    this.billListSub = this.apiDataBomService.index().subscribe( res => {
      this.billList = res;
    });
  }

  onNodeSelect(clickedItem: any) {
    // when a tree node is selected, toggle node collapse
    const oopNodeController = this.treeComponent.getControllerByNodeId(clickedItem.node.id);
    oopNodeController.unselect();
    if (oopNodeController.isCollapsed()) {
      oopNodeController.expand();
    } else {
      oopNodeController.collapse();
    }
  }

  onBomSelect(selected: number) {
    this.showBom = false;

    // get the selected BOM as flat array
    const bomSubscription = this.apiDataBomService.showSingleBom(selected).subscribe( res => {
      this.bill = res;
      bomSubscription.unsubscribe();
      console.log(this.bill);

      // initialize bomtree
      this.bomTree = {
        value: this.bill[0].ParentName,
        id: this.bill[0].ParentID
      };

      // recursively parse the BOM structure
      const blaa = this.bomTraverse(0, 1);
      this.bomTree.children = blaa[0];
      this.showBom = true;
      console.log(this.bomTree);
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

}
