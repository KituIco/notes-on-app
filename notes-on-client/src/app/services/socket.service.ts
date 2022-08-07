import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Block } from '../interfaces/block';
import { Page } from '../interfaces/page';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  blockChanged = this.socket.fromEvent<Block>('blockChanged');
  pageChanged = this.socket.fromEvent<Page>('pageChanged');
  blockAdded = this.socket.fromEvent<Block>('blockAdded');
  orderChanged = this.socket.fromEvent<Block[]>('orderChanged');
  onChanged = this.socket.fromEvent<null>('onChanged');
  
  constructor(
    private socket: Socket,
  ) { }

  joinPage(pageId: string): void {
    this.socket.emit('joinPage', { pageId });
  }

  pageChanges(pageId: string): void {
    this.socket.emit("pageChanges", { pageId });
  }
}
