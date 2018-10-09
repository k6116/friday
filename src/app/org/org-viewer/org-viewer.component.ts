import { Component, OnInit } from '@angular/core';
import { OrgViewerService } from './org-viewer.service';

@Component({
  selector: 'app-org-viewer',
  templateUrl: './org-viewer.component.html',
  styleUrls: ['./org-viewer.component.css', '../../_shared/styles/common.css'],
  providers: [OrgViewerService]
})
export class OrgViewerComponent implements OnInit {

  orgJson: any; // for storing nested org JSON structure

  constructor(private orgViewerService: OrgViewerService) { }

  async ngOnInit() {
    const bla = await this.orgViewerService.getOrg('ron_nersesian@keysight.com');
    this.orgJson = bla;
  }

}
