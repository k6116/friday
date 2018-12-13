import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';
import { MatplanInfoComponent } from '../matplan-info/matplan-info.component';
import { MatplanBomComponent } from '..//matplan-bom/matplan-bom.component';
import { MatplanQuoteComponent } from '../matplan-quote/matplan-quote.component';
import { MatplanOrderComponent } from '../matplan-order/matplan-order.component';

@Component({
  selector: 'app-matplan-editor',
  templateUrl: './matplan-editor.component.html',
  styleUrls: ['./matplan-editor.component.css', '../../_shared/styles/common.css']
})
export class MatplanEditorComponent implements OnInit {

  matplanID: number;  // for getting matplanID to query from router params
  projectID: number;
  matplan: any;
  stepsOpen = [false, false, false, false]; // show which steps are open

  @ViewChild('MatplanInfoComponent') matplanInfoComponent: MatplanInfoComponent;
  @ViewChild('MatplanBomComponent') matplanBomComponent: MatplanBomComponent;
  @ViewChild('MatplanQuoteComponent') matplanQuoteComponent: MatplanQuoteComponent;
  @ViewChild('MatplanOrderComponent') matplanOrderComponent: MatplanOrderComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiDataMatplanService: ApiDataMatplanService
  ) {
    // get the matplan id from the route params
    this.matplanID = activatedRoute.snapshot.params['id'];
  }

  ngOnInit() {
    this.apiDataMatplanService.show(this.matplanID).subscribe( res => {
      this.matplan = res[0];
      this.projectID = this.matplan.ProjectID;
    });
  }

  openStep(stepNum: number) {
    this.stepsOpen = [false, false, false, false];
    this.stepsOpen[stepNum] = true;
  }

}
