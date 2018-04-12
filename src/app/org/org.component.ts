
import { Component, OnInit, Input } from '@angular/core';
import { AppDataService } from '../_shared/services/app-data.service';

@Component({
  selector: 'app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.css']
})
export class OrgComponent implements OnInit {

  @Input() employees;
  blockClickEvent: boolean;

  constructor(
    private appDataService: AppDataService
  ) { }

  ngOnInit() {
  }

  onExpandCollapseIconClick(employee, index, event: Event) {
    event.stopPropagation();
    this.appDataService.employeeIcon.emit(employee);
  }

  onEmployeeNameClick(employee, i, event: Event) {
    event.stopPropagation();
    this.appDataService.employee.emit(employee);
  }

}

