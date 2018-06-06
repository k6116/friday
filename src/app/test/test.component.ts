import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as io from 'socket.io-client';

declare var $: any;

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css', '../_shared/styles/common.css']
})
export class TestComponent implements OnInit {

  @ViewChild('message') message: ElementRef;

  private url = 'http://localhost:3000';
  private socket;
  messages: string[] = [];
  inputText: string;

  constructor () {

  }

  ngOnInit() {

    this.socket = io();

    this.inputText = 'asdfsd';

    this.socket.on('news', function (data) {
      console.log(data);
      // this.socket.emit('my other event', { my: 'data' });
    });

    this.socket.on('message', function (messages) {
      console.log(messages);
      this.messages = messages;
      $('#messages').append($('<li>').text(messages[messages.length - 1]));
      // this.message.nativeElement.value = '';
    });

  }

  onSendMessageClick() {
    const text = this.message.nativeElement.value;
    this.messages.push(text);
    console.log('messages array');
    console.log(this.messages);
    this.socket.emit('message', this.messages);
    this.inputText = '';
    // console.log(`send message button clicked: ${this.message}`);
    // console.log(this.message.nativeElement.value);
    // console.log('socket:');
    // console.log(this.socket);
    // this.socket.emit('my other event', 'hello bill');
    // this.socket.emit('message', 'some text message');
  }



}
