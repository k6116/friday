import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';
import { TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-bom-editor',
  templateUrl: './bom-editor.component.html',
  styleUrls: ['./bom-editor.component.css', '../../_shared/styles/common.css']
})
export class BomEditorComponent implements OnInit {

  bomJson: any;
  showBom = true;  // show ng2-tree BOM component
  treeOptions: ITreeOptions;  // options for angular2-tree component

  // for showing details when clicking a node
  showDetails = false;
  details: any;

  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
    this.treeOptions = {
      actionMapping: {
        mouse: {
          dblClick: (tree, node, $event) => {
            if (node.hasChildren) {
              TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
            }
          },
          contextMenu: (tree, node, $event) => {
            // console.log(node);
            node.data.qty = 0;
            this.bomJson = this.bomJson.slice();
          }
        },
        keys: {
          [KEYS.ENTER]: (tree, node, $event) => {
            node.expandAll();
          }
        }
      }
    };
  }

  showBomJson() {
    // console.log(this.bomJson);
  }

  onBomSelect(selectedBom: any) {
    this.showBom = true;
    this.showDetails = false;
    this.bomJson = [selectedBom];
    // console.log('bom has been selected');
  }

}
