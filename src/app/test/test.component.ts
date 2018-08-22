import { Component, OnInit } from '@angular/core';
import { ApiDataEmailService } from '../_shared/services/api-data/_index';
import { AuthService } from '../_shared/services/auth.service';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {


constructor (
  private apiDataEmailService: ApiDataEmailService,
  private authService: AuthService
) {

  }

  ngOnInit() {

  }

  requestClick() {
      this.apiDataEmailService.sendRequestProjectEmail(125, 125, 'Some Project Name', 'Some Action').subscribe(
        res => {

        },
        err => {
          // console.log(err);
        }
      );
  }

  approveClick() {

    this.apiDataEmailService.sendProjectApprovalEmail(125, 125, 'Some Project Name', false, 'Will need more User in 2nd Quarter').subscribe(
      res => {

      },
      err => {
        // console.log(err);
      }
    );
  }

  testClick() {
    console.log('manageremail', this.authService.loggedInUser.managerEmailAddress)
  }
}
