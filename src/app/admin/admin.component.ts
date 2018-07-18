import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css', '../_shared/styles/common.css']
})
export class AdminComponent implements OnInit {

  selection: any;

  constructor() {}

  ngOnInit() {}

  onSelectionClick(event: any) {
    this.selection = event.target.value;
    console.log('Selected:', this.selection);
  }

}
