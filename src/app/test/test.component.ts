import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../_shared/services/api-data.service';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {


constructor (private apiDataService: ApiDataService) {

  }

  ngOnInit() {

  }

  requestClick() {
      this.apiDataService.sendRequestProjectEmail(125, 125, 'Some Project Name').subscribe(
        res => {

        },
        err => {
          console.log(err);
        }
      );
  }

  approveClick() {

    this.apiDataService.sendProjectApprovalEmail(125, 125, 'Some Project Name', false, 'Will need more User in 2nd Quarter').subscribe(
      res => {

      },
      err => {
        console.log(err);
      }
    );
  }
}
