import { Component, OnInit } from '@angular/core';
const { version: appVersion } = require('../../../package.json');

declare const require: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  appVersion: string;

  constructor() {
    this.appVersion = appVersion;
  }

  ngOnInit() {
  }

}
