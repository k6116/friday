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

  bomJson: any;
  showBom = false;  // show ng2-tree BOM component

  // for showing details when clicking a node
  showDetails = false;
  details: any;

  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
  }

  onBomSelect(selectedBom: any) {
    this.showBom = true;
    this.showDetails = false;
    this.bomJson = selectedBom;
  }

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
