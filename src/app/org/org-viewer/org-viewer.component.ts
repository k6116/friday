import { Component, OnInit, HostListener } from '@angular/core';
import { OrgViewerService } from './org-viewer.service';
import { AuthService, ToolsService } from '../../_shared/services/_index';

declare var $: any;
@Component({
  selector: 'app-org-viewer',
  templateUrl: './org-viewer.component.html',
  styleUrls: ['./org-viewer.component.css', '../../_shared/styles/common.css'],
  providers: [OrgViewerService]
})
export class OrgViewerComponent implements OnInit {

  orgJson: any; // for storing nested org JSON structure

  @HostListener('document:keydown', ['$event']) onKeyPress(event) {
    if (event.code === 'Escape') {
      // if user is in full-screen mode, pressing escape will close it
      const currentState = $('.org-chart-cont').attr('class');
      if (currentState.search('org-chart-cont-full')) {
        this.expandChartFullscreen();
      }
    }
  }

  constructor(
    private orgViewerService: OrgViewerService,
    private authService: AuthService,
    private toolsService: ToolsService
  ) { }

  async ngOnInit() {
    // this.toolsService.hideFooter();
    const bla = await this.orgViewerService.getOrg(this.authService.loggedInUser.managerEmailAddress);
    this.orgJson = bla;
  }

  expandChartFullscreen() {
    // toggle the full-screen CSS class
    $('.org-chart-cont').toggleClass('org-chart-cont-full');
  }

}
