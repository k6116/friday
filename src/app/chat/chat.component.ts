import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WebsocketService } from '../_shared/services/websocket.service';
import { Subscription } from 'rxjs/Subscription';
import { ApiDataService } from '../_shared/services/api-data.service';
import { AuthService } from '../auth/auth.service';
import * as io from 'socket.io-client';
import * as faker from 'faker';
import * as moment from 'moment';
import * as _ from 'lodash';

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
  subscription3: Subscription;
  subscription4: Subscription;
  userMessage: string;
  messages: any[] = [];
  loggedInUsers: any;

  constructor (
    private websocketService: WebsocketService,
    private apiDataService: ApiDataService,
    private authService: AuthService
    ) {

  }

  ngOnInit() {

    // create and store a fake user name using the faker library
    this.userName = faker.name.firstName().toLowerCase() + faker.random.number().toString().substring(0, 2);
    this.userName = this.authService.loggedInUser.userName + faker.random.number().toString().substring(0, 2);

    // open a client socket
    // this.socket = io();

    // // listen for emits for 'message'
    // this.socket.on('message', message => {
    //   $('#messages').append($('<p>').text(message));
    // });

    // get logged in users from the server as array of objects
    this.getLoggedInUsers();

    this.subscription1 = this.websocketService.getMessages().subscribe(message => {
      this.messages.unshift(message);
      // _.reverse(this.messages);
    });

    this.subscription2 = this.websocketService.getLoggedInUser().subscribe(users => {
      this.userMessage = `${users['fullName']} just logged in`;
      setTimeout(() => {
        this.userMessage = '';
      }, 3000);
      this.getLoggedInUsers();
    });

    this.subscription3 = this.websocketService.getLoggedOutUser().subscribe(user => {
      this.userMessage = `${user['fullName']} just logged out`;
      setTimeout(() => {
        this.userMessage = '';
      }, 3000);
      this.getLoggedInUsers();
    });

  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
  }

  getLoggedInUsers() {

    this.apiDataService.getLoggedInUsers()
      .subscribe(
        res => {
          console.log('logged in users');
          console.log(res);
          this.loggedInUsers = res;
        },
        err => {
          console.error('error getting logged in users');
        }
      );

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
