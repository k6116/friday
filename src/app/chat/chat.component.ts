import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WebsocketService } from '../_shared/services/websocket.service';
import { Subscription } from 'rxjs/Subscription';
import * as io from 'socket.io-client';
import * as faker from 'faker';
import * as moment from 'moment';

declare var $: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css', '../_shared/styles/common.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('message') message: ElementRef;

  url = 'http://localhost:3000';  // don't need this, it will be set by default
  socket;
  inputText: string;
  userName: string;
  activeUsers: string;
  subscription1: Subscription;
  subscription2: Subscription;
  userMessage: string;

  constructor (
    private websocketService: WebsocketService
    ) {

  }

  ngOnInit() {

    // create and store a fake user name using the faker library
    this.userName = faker.name.firstName().toLowerCase() + faker.random.number().toString().substring(0, 2);

    // open a client socket
    // this.socket = io();

    // // listen for emits for 'message'
    // this.socket.on('message', message => {
    //   $('#messages').append($('<p>').text(message));
    // });

    this.subscription1 = this.websocketService.getMessages().subscribe(message => {
      $('#messages').append($('<p>').text(message));
    });

    this.subscription2 = this.websocketService.getUsers().subscribe(users => {
      this.userMessage = `${users['fullName']} just logged in`;
      setTimeout(() => {
        this.userMessage = '';
      }, 3000);
    });

  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  // send message button click
  onSendMessageClick() {

    // get the current time
    const currentTime = moment().format('ddd h:mm:ss a');

    // emit the message
    // this.socket.emit('message', `${this.userName} (${currentTime}): ${this.inputText}`);

    // emit the message
    this.websocketService.sendMessage(`${this.userName} (${currentTime}): ${this.inputText}`);

    // clear the input
    this.inputText = '';

  }

}
