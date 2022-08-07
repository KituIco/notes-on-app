import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from "rxjs";
import { catchError, tap, map } from 'rxjs/operators';

import { User } from '../interfaces/user';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = "http://localhost:3000/users";

  httpOptions: {headers: HttpHeaders} = {
    headers: new HttpHeaders({ "Content-type": "application/json" })
  }

  httpOptionsImg: {headers: HttpHeaders} = {
    headers: new HttpHeaders(),
  }

  constructor(
    private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
  ) { }

  getUser(id: string): Observable<User> {
    const url = `${this.url}/${id}`;
    return this.http.get<{data:User}>(url, this.httpOptions)
      .pipe(
        map((results: {data:User}) => results.data as User),
        catchError( this.errorHandlerService.handleError<User>('getUser'))
      );
  }

  patchUser(formData: Partial<User>, id: string):  Observable<User> {
    const patchData = {"data":formData}
    const url = `${this.url}/${id}`;
    return this.http.patch<{data:User}>(url, patchData , this.httpOptions)
      .pipe(
        map((results:{data:User})=> results.data as User),
        catchError( this.errorHandlerService.handleError<User>('patchUser'))
      );
  }

  patchUserIcon(formData: Partial<User>, id: string): Observable<User> {
    let patchData = new FormData();
    patchData.append("image", formData.icon!, `usericon_${id}`)
    const url = `${this.url}/${id}`;
    return this.http.patch<{data:User}>(url, patchData , this.httpOptionsImg)
      .pipe(
        map((results:{data:User})=> results.data as User),
        catchError( this.errorHandlerService.handleError<User>('patchUserIcon'))
      );
  }
  
}
