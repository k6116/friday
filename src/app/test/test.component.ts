import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css', '../_shared/styles/common.css']
})
export class TestComponent implements OnInit {

  private url = 'http://localhost:3000';
  private socket;

constructor () {

}

  ngOnInit() {

    this.socket = io(this.url);

  }
}
