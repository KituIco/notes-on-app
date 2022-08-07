import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from "rxjs";
import { catchError, tap, map } from 'rxjs/operators';

import { Block } from '../interfaces/block';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private url = "http://localhost:3000/workspaces";

  httpOptions: {headers: HttpHeaders} = {
    headers: new HttpHeaders({ "Content-type": "application/json" }),
  }

  httpOptionsImg: {headers: HttpHeaders} = {
    headers: new HttpHeaders(),
  }

  httpOptionsImgur: {headers: HttpHeaders} = {
    headers: new HttpHeaders({ "Authorization": 'Client-ID c754d910554a80a' }),
  }

  constructor(
    private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
  ) { }

  postBlock(formData: Partial<Block>, wsid: string, pid: string): Observable<Block> {
    const postData = {"data":formData}
    const url = `${this.url}/${wsid}/pages/${pid}/blocks/`
    return this.http.post<{data:Block}>(url, postData , this.httpOptions)
      .pipe(
        map((results:{data:Block})=> results.data as Block),
        catchError( this.errorHandlerService.handleError<Block>('postPage'))
      );
  }

  getBlocks(wsid: string, pid: string): Observable<Block[]> {
    const url = `${this.url}/${wsid}/pages/${pid}/blocks/`
    return this.http.get<{data:Block[]}>(url, this.httpOptions)
      .pipe(
        map((results:{data:Block[]})=> results.data as Block[]),
        catchError( this.errorHandlerService.handleError<Block[]>('getBlocks', []))
      );
  }

  patchBlock(formData: Partial<Block>, wsid: string, pid: string, id: string):  Observable<Block> {
    const patchData = {"data":formData}
    const url = `${this.url}/${wsid}/pages/${pid}/blocks/${id}`;
    return this.http.patch<{data:Block}>(url, patchData , this.httpOptions)
      .pipe(
        map((results:{data:Block})=> results.data as Block),
        catchError( this.errorHandlerService.handleError<Block>('patchBlock'))
      );
  }

  patchBlockImg(formData: Partial<Block>, wsid: string, pid: string, id: string):  Observable<Block> {
    let patchData = new FormData();
    patchData.append("image", formData.content!, `block_${id}`)
    const url = `${this.url}/${wsid}/pages/${pid}/blocks/${id}`;
    return this.http.patch<{data:Block}>(url, patchData , this.httpOptionsImg)
      .pipe(
        map((results:{data:Block})=> results.data as Block),
        catchError( this.errorHandlerService.handleError<Block>('patchBlockImg'))
      );
  }

  patchBlockImgur(file: File):  Observable<any> {
    let patchData = new FormData();
    patchData.append("image", file)
    const url = "https://api.imgur.com/3/image/";
    return this.http.post(url, patchData , this.httpOptionsImgur)
      .pipe(
        catchError( this.errorHandlerService.handleError<any>('patchBlockImgur'))
      );
  }

  patchBlockOrder(formData: Partial<Block>, wsid: string, pid: string):  Observable<Block[]> {
    const patchData = {"data":formData}
    const url = `${this.url}/${wsid}/pages/${pid}/blocks/`;
    return this.http.patch<{data:Block[]}>(url, patchData , this.httpOptions)
      .pipe(
        map((results:{data:Block[]})=> results.data as Block[]),
        catchError( this.errorHandlerService.handleError<Block[]>('patchBlockOrder', []))
      );
  }

  deleteBlock(wsid: string, pid: string, id: string): Observable<Block[]> {
    const url = `${this.url}/${wsid}/pages/${pid}/blocks/${id}`;
    return this.http.delete<{data: Block[]}>(url, this.httpOptions)
      .pipe(
        map((results:{data:Block[]})=> results.data as Block[]),
        catchError( this.errorHandlerService.handleError<Block[]>('deleteBlock'))
      );
  }
}
