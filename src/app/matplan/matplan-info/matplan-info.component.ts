import { Component, OnInit, Input } from '@angular/core';
import { ApiDataMatplanService, ApiDataProjectService } from '../../_shared/services/api-data/_index';

@Component({
  selector: 'app-matplan-info',
  templateUrl: './matplan-info.component.html',
  styleUrls: ['./matplan-info.component.css', '../../_shared/styles/common.css']
})
export class MatplanInfoComponent implements OnInit {

  @Input() projectID: number;
  projectData: any;
  projectRoster: any;

  constructor(
    private apiDataMatplanService: ApiDataMatplanService,
    private apiDataProjectService: ApiDataProjectService) { }

  ngOnInit() {
    this.apiDataProjectService.getProject(this.projectID).subscribe( res => {
      this.projectData = res[0];
    });

    this.apiDataProjectService.getProjectRoster(this.projectID).subscribe( res => {
      if (res[0].hasOwnProperty('teamMembers')) {
        this.projectRoster = res[0].teamMembers;
      } else {
        this.projectRoster = null;
      }
    });
  }

}
