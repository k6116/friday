import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from '../_shared/services/chat.service';
import * as io from 'socket.io-client';
import * as faker from 'faker';
import * as moment from 'moment';

declare var $: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css', '../_shared/styles/common.css']
})
export class ChatComponent implements OnInit {

  @ViewChild('message') message: ElementRef;

  url = 'http://localhost:3000';  // don't need this, it will be set by default
  socket;
  inputText: string;
  userName: string;
  activeUsers: string;

  constructor (private chatService: ChatService) {

  }

  ngOnInit() {

    // create and store a fake user name using the faker library
    this.userName = faker.name.firstName().toLowerCase() + faker.random.number().toString().substring(0, 2);

    // open a client socket
    this.socket = io();

    // listen for emits for 'message'
    this.socket.on('message', message => {
      $('#messages').append($('<p>').text(message));
    });

    this.chatService.messages.subscribe(msg => {
      console.log(msg);
    });

  }

  // send message button click
  onSendMessageClick() {

    // get the current time
    const currentTime = moment().format('ddd h:mm:ss a');
    // emit the message
    this.socket.emit('message', `${this.userName} (${currentTime}): ${this.inputText}`);
    // clear the input
    this.inputText = '';

  }

}
