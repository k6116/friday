import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class WebsocketService {

  private url = 'http://localhost:3000';  // don't need this, it will be set by default
  private socket;

  constructor() {
    // this.socket = io();
  }

  connect() {
    this.socket = io();
  }

  sendMessage(message) {
    this.socket.emit('message', message);
  }

  getMessages() {
    const observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
      // return () => {
      //   this.socket.disconnect();
      // };
    });
    return observable;
  }

  sendLoggedInUser(loggedInUser) {
    this.socket.emit('loggedInUser', loggedInUser);
  }

  getLoggedInUser() {
    const observable = new Observable(observer => {
      this.socket.on('loggedInUser', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  sendLoggedOutUser(loggedOutUser) {
    this.socket.emit('loggedOutUser', loggedOutUser);
  }

  getLoggedOutUser() {
    const observable = new Observable(observer => {
      this.socket.on('loggedOutUser', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

}
