
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppDataService } from '../_shared/services/app-data.service';
// import { EventEmitter } from 'events';

@Component({
  selector: 'app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.css']
})
export class OrgComponent implements OnInit {

  @Input() employees;
  @Output() nodeFullName = new EventEmitter<string>();

  blockClickEvent: boolean;


  constructor(
    private appDataService: AppDataService
  ) { }

  ngOnInit() {
  }

  // onExpandCollapseIconClick(employee, index, event: Event) {
  //   event.stopPropagation();
  //   this.appDataService.employeeIcon.emit(employee);
  // }

  // onEmployeeNameClick(employee, i, event: Event) {
  //   event.stopPropagation();
  //   this.appDataService.employee.emit(employee);
  // }

  onFullNameClick(text: string) {
    this.nodeFullName.emit(text);
    console.log('Inner Event: ' + text);
  }

  onFullNameChildClick(text: string) {
    this.nodeFullName.emit(text);
    console.log('Inner Child Event: ' + text);
  }

}

