import { Component, OnInit } from '@angular/core';
import { ApiDataEmailService } from '../_shared/services/api-data/_index';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {


constructor (private apiDataEmailService: ApiDataEmailService) {

  }

  ngOnInit() {

  }

  requestClick() {
      this.apiDataEmailService.sendRequestProjectEmail(125, 125, 'Some Project Name').subscribe(
        res => {

        },
        err => {
          console.log(err);
        }
      );
  }

  approveClick() {

    this.apiDataEmailService.sendProjectApprovalEmail(125, 125, 'Some Project Name', false, 'Will need more User in 2nd Quarter').subscribe(
      res => {

      },
      err => {
        console.log(err);
      }
    );
  }
}
