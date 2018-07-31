import { Component, OnInit, ViewChild } from '@angular/core';
import { TreeModel } from 'ng2-tree';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';
import { ViewEncapsulation } from '@angular/core';

declare var Treant: any;
declare var $: any;

@Component({
  // encapsulation: ViewEncapsulation.None,
  selector: 'app-bom-viewer',
  templateUrl: './bom-viewer.component.html',
  styleUrls: ['./bom-viewer.component.css', '../../_shared/styles/common.css']
})
export class BomViewerComponent implements OnInit {

  @ViewChild('treeComponent') treeComponent;

  billList: any;  // for getting the list of bills in drop-down
  billListSub: Subscription;
  bill: any;  // for storing the selected bill as flat array

  showBom = false;

  my_chart: any;
  nodeStructure: any; // for storing the selected bill as tree JSON
  chart: any;

  // for showing details when clicking a ndoe
  showDetails = false;
  details: any;

  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
    // get list of bills in drop-down
    this.billListSub = this.apiDataBomService.index().subscribe( res => {
      this.billList = res;
    });
  }

  onBomSelect(selected: number) {
    this.my_chart = {};
    this.showBom = false;
    this.showDetails = false;

    // get the selected BOM as flat array
    const bomSubscription = this.apiDataBomService.showSingleBom(selected).subscribe( res => {
      this.bill = res;
      bomSubscription.unsubscribe();
      console.log(this.bill);

      this.my_chart = {
        chart: {
          container: '#tree-simple',
          levelSeparation: 100,
          siblingSeparation: 20,
          connectors: {type: 'curve'},
          rootOrientation: 'NORTH',
          nodeAlign: 'BOTTOM',
          node: {collapsable: true}
        }
      };
      // initialize bomtree
      this.nodeStructure = {
        text: {name: {val: this.bill[0].ParentName}}
        // id: this.bill[0].ParentID,
        // type: this.bill[0].ParentEntity
      };

      // recursively parse the BOM structure
      const blaa = this.bomTraverse(0, 1);
      console.log(blaa);
      this.nodeStructure.children = blaa[0];
      this.my_chart.nodeStructure = this.nodeStructure;
      console.log('chart');
      console.log(this.my_chart);
      this.showBom = true;
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Treant(this.my_chart, this.onTreeLoadComplete, $);
    });
  }

  onTreeLoadComplete() {
    console.log('completed');
  }

  bomTraverse(i: number, lv: number) {
    // i = index of the array to start traversing (usu 0)
    // lv - initial level of the BOM (usu 1)
    const children = [];
    while (i < this.bill.length) {
      if (this.bill[i].Level === lv) {
        // traverse down and collect all the siblings in this level
        children.push({
          text: {name: this.bill[i].ChildName}
          // id: this.bill[i].ChildID,
          // type: this.bill[i].ChildEntity
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
