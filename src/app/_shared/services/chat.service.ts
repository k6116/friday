import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class ChatService {

  messages: Subject<any>;
  activeUsers: Subject<any>;

  // Our constructor calls our wsService connect method
  constructor(private wsService: WebsocketService) {

    this.messages = <Subject<any>>wsService
      .connect()
      .map((response: any): any => {
        return response;
      });

    this.activeUsers = <Subject<any>>wsService
      .connect()
      .map((response: any): any => {
        return response;
      });
   }

  // Our simplified interface for sending
  // messages back to our socket.io server
  sendMessage(message) {
    this.messages.next(message);
  }

  sendActiveUsers(activeUsers) {
    this.messages.next(activeUsers);
  }

}
