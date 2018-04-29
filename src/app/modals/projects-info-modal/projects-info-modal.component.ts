import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';

@Component({
  selector: 'app-projects-info-modal',
  templateUrl: './projects-info-modal.component.html',
  styleUrls: ['./projects-info-modal.component.css']
})
export class ProjectsInfoModalComponent implements OnInit {

  project: any;
  projectRoster: any;

  @Input() set selectedProject(value: any) {
    this.project = value;
    console.log(this.project);
    if (this.project) {
      this.getProjectRoster();
    }
  }

  @Output() close = new EventEmitter<boolean>();

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
