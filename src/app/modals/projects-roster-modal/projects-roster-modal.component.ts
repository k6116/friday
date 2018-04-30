import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';

@Component({
  selector: 'app-projects-roster-modal',
  templateUrl: './projects-roster-modal.component.html',
  styleUrls: ['./projects-roster-modal.component.css']
})
export class ProjectsRosterModalComponent implements OnInit {

  @Input() set selectedProject(value: any) {
    console.log('input received in projects roster modal');
    this.project = value;
    console.log(this.project);
    if (this.project) {
      this.getProjectRoster();
    }
  }
  @Output() close = new EventEmitter<boolean>();

  project: any;
  projectRoster: any;


  constructor(
    private apiDataService: ApiDataService
  ) { }

  ngOnInit() {
  }

  getProjectRoster() {
    console.log('getting project roster');
    this.apiDataService.getProjectRoster(this.project.ProjectID)
    .subscribe(
      res => {
        console.log('project roster:');
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
  }

  onCloseClick() {
    console.log('close button clicked');
    this.close.emit(true);
  }

}
