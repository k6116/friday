import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-team-fte-summary-team-select-dropdown',
  templateUrl: './team-fte-summary-team-select-dropdown.component.html',
  styleUrls: ['./team-fte-summary-team-select-dropdown.component.css']
})
export class TeamFteSummaryTeamSelectDropdownComponent implements OnInit {

  @Input() employees: any;
  @Output() clickedEmployeeIcon = new EventEmitter<any>();
  @Output() clickedEmployee = new EventEmitter<any>();


  constructor() {
  }

  ngOnInit() {
  }

  onExpandCollapseIconClick(employee) {
    this.emitClickedEmployeeIcon(employee);
  }

  onEmployeeNameClick(employee) {
    this.emitClickedEmployee(employee);
  }

  onclickedEmployeeIcon(employee) {
    this.emitClickedEmployeeIcon(employee);
  }

  onclickedEmployee(employee) {
    this.emitClickedEmployee(employee);
  }

  emitClickedEmployee(employee) {
    this.clickedEmployee.emit(this.getEmployeeObject(employee));
  }

  emitClickedEmployeeIcon(employee) {
    this.clickedEmployeeIcon.emit(this.getEmployeeObject(employee));
  }

  // only return select properties (removing nested employees etc.)
  getEmployeeObject(employee): any {
    return {
      emailAddress: employee.emailAddress,
      employeeID: employee.employeeID,
      fullName: employee.fullName,
      level: employee.level,
      numEmployees: employee.numEmployees,
      personID: employee.personID,
      showEmployees: employee.showEmployees,
      supervisorID: employee.supervisorID,
      uid: employee.uid
    };
  }

}
