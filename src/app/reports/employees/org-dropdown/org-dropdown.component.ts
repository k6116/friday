import { Component, OnInit, Input } from '@angular/core';
import { AppDataService } from '../../../_shared/services/app-data.service';

@Component({
  selector: 'app-org-dropdown',
  templateUrl: './org-dropdown.component.html',
  styleUrls: ['./org-dropdown.component.css']
})
export class OrgDropdownComponent implements OnInit {

  // @Input() employees: any;
  employees: any;

  constructor(
    private appDataService: AppDataService
  ) { }

  ngOnInit() {
    this.employees = this.appDataService.$nestedOrgData;
    console.log('employees array on org dropdown component init:');
    console.log(this.employees);
  }

}
