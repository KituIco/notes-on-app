import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from "rxjs";
import { catchError, tap, map } from 'rxjs/operators';

import { Workspace } from '../interfaces/workspace';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private url = "http://localhost:3000/workspaces";
  private usersUrl = "http://localhost:3000/users";

  private onWorkspace = new Subject<Partial<Workspace>>();
  onSpace$ = this.onWorkspace.asObservable();

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

  onSpace(space: Partial<Workspace>): void {
    this.onWorkspace.next(space);
  }

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<{data:Workspace[]}>(this.url, this.httpOptions)
      .pipe(
        map((results: {data:Workspace[]}) => results.data as Workspace[]),
        catchError( this.errorHandlerService.handleError<Workspace[]>('getWorkspaces', []))
      );
  }

  postWorkspace(formData: Partial<Workspace>): Observable<Workspace> {
    const postData = {"data":formData}
    return this.http.post<{data:Workspace}>(this.url, postData , this.httpOptions)
      .pipe(
        map((results:{data:Workspace})=> results.data as Workspace),
        catchError( this.errorHandlerService.handleError<Workspace>('postWorkspace'))
      );
  }

  getWorkspace(id: string): Observable<Workspace> {
    const url = `${this.url}/${id}`;
    return this.http.get<{data:Workspace}>(url, this.httpOptions)
      .pipe(
        map((results: {data:Workspace}) => results.data as Workspace),
        catchError( this.errorHandlerService.handleError<Workspace>('getWorkspace'))
      );
  }

  patchWorkspace(formData: Partial<Workspace>, id: string):  Observable<Workspace> {
    const patchData = {"data":formData}
    const url = `${this.url}/${id}`;
    return this.http.patch<{data:Workspace}>(url, patchData , this.httpOptions)
      .pipe(
        map((results:{data:Workspace})=> results.data as Workspace),
        catchError( this.errorHandlerService.handleError<Workspace>('patchWorkspace'))
      );
  }

  getUserSpaces(id:string): Observable<Workspace[]> {
    const url = `${this.usersUrl}/${id}/workspaces`;
    return this.http.get<{data:Workspace[]}>(url, this.httpOptions)
      .pipe(
        map((results: {data:Workspace[]}) => results.data as Workspace[]),
        catchError( this.errorHandlerService.handleError<Workspace[]>('getWorkspaces', []))
      );
  }

  patchSpaceCover(formData: Partial<Workspace>, wsid: string): Observable<Workspace> {
    let patchData = new FormData();
    patchData.append("image", formData.cover!, `spacecover_${wsid}`)
    const url = `${this.url}/${wsid}`;
    return this.http.patch<{data:Workspace}>(url, patchData , this.httpOptionsImg)
      .pipe(
        map((results:{data:Workspace})=> results.data as Workspace),
        catchError( this.errorHandlerService.handleError<Workspace>('patchPageCover'))
      );
  }

  patchSpaceIcon(formData: Partial<Workspace>, wsid: string): Observable<Workspace> {
    let patchData = new FormData();
    patchData.append("image", formData.icon!, `spaceicon_${wsid}`)
    const url = `${this.url}/${wsid}`;
    return this.http.patch<{data:Workspace}>(url, patchData , this.httpOptionsImg)
      .pipe(
        map((results:{data:Workspace})=> results.data as Workspace),
        catchError( this.errorHandlerService.handleError<Workspace>('patchPageIcon'))
      );
  }

  deleteWorkspace(wsid: string): Observable<Workspace[]> {
    const url = `${this.url}/${wsid}`;
    return this.http.delete<{data: Workspace[]}>(url, this.httpOptions)
      .pipe(
        map((results:{data:Workspace[]})=> results.data as Workspace[]),
        catchError( this.errorHandlerService.handleError<Workspace[]>('deleteWorkspace', []))
      );
  }
}
