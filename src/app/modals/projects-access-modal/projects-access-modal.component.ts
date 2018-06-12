import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../auth/auth.service';


declare var $: any;

@Component({
  selector: 'app-projects-access-modal',
  templateUrl: './projects-access-modal.component.html',
  styleUrls: ['./projects-access-modal.component.css']
})
export class ProjectsAccessModalComponent implements OnInit {

  @Input() projectData: any;
  @Output() requestSuccess = new EventEmitter<boolean>();

  userID: any;

  constructor(
    private apiDataService: ApiDataService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    // get the user id
    this.userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;
  }

  onProjectAccessClick(status: string) {
    // 3 cases: user requests access for the first time, user cancels request, user re-requests after being denied access
    if (status === 'Request') {
      this.apiDataService.updateProjectAccessRequest(this.projectData, 'Submitted', 'Requesting access', this.userID)
      .subscribe(
        res => {
          console.log(res);
          this.requestSuccess.emit(true);
        },
        err => {
          console.log(err);
        }
      );
    } else if (status === 'Rescind') {
      this.apiDataService.updateProjectAccessRequest(this.projectData, 'Cancelled', 'Cancelling request access', this.userID)
      .subscribe(
        res => {
          console.log(res);
          this.requestSuccess.emit(true);
        },
        err => {
          console.log(err);
        }
      );
    } else if (status === 'Re-request') {
      this.apiDataService.updateProjectAccessRequest(this.projectData, 'Submitted', 'Resubmitting request access', this.userID)
      .subscribe(
        res => {
          console.log(res);
          this.requestSuccess.emit(true);
        },
        err => {
          console.log(err);
        }
      );

    }
    console.log(this.projectData);

  }


}
