import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-org-dropdown',
  templateUrl: './org-dropdown.component.html',
  styleUrls: ['./org-dropdown.component.css']
})
export class OrgDropdownComponent implements OnInit {

  @Input() employees: any;
  @Output() clickedEmployeeIcon = new EventEmitter<any>();
  @Output() clickedEmployee = new EventEmitter<any>();


  constructor() {
  }

  ngOnInit() {
  }

  onExpandCollapseIconClick(employee) {
    this.clickedEmployeeIcon.emit(
      {
        uid: employee.uid,
        fullName: employee.fullName,
        emailAddress: employee.emailAddress
      }
    );
  }

  onEmployeeNameClick(employee) {
    this.clickedEmployee.emit(
      {
        uid: employee.uid,
        fullName: employee.fullName,
        emailAddress: employee.emailAddress
      }
    );
  }

  onclickedEmployeeIcon(employee) {
    this.clickedEmployeeIcon.emit(
      {
        uid: employee.uid,
        fullName: employee.fullName,
        emailAddress: employee.emailAddress
      }
    );
  }

  onclickedEmployee(employee) {
    this.clickedEmployee.emit(
      {
        uid: employee.uid,
        fullName: employee.fullName,
        emailAddress: employee.emailAddress
      }
    );
  }



}
