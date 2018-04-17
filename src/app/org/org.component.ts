import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppDataService } from '../_shared/services/app-data.service';

@Component({
  selector: 'app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.css']
})
export class OrgComponent implements OnInit {

  @Input() employees;
  @Output() nodeFullName = new EventEmitter<string>();

  nameClicked: string;

  constructor(
    private appDataService: AppDataService
  ) { }

  ngOnInit() {
  }

  onFullNameClick(text: string) {

    this.nodeFullName.emit(text);
    console.log('Inner Event: ' + text);
    this.nameClicked = text;
  }

  onFullNameChildClick(text: string) {
    this.nodeFullName.emit(text);
    console.log('Inner Child Event: ' + text);
  }

  getLineClass(employee: any) {
    if (employee.employees) {
      if (employee.showEmployees) { return 'list-unstyled down-arrow'; }
      if (!employee.showEmployees) { return 'list-unstyled right-arrow'; }
    } else { return 'list-unstyled default'; }
  }

  getNameClass(employee: any) {
    if (employee.fullName === this.nameClicked) { return 'fullName fullNameClicked'; } else { return 'fullName'; }
  }
}
