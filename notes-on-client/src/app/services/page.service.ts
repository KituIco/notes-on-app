import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, Subject } from "rxjs";
import { catchError, tap, map } from 'rxjs/operators';

import { Page, Search } from '../interfaces/page';
import { PageBlock } from '../interfaces/pageblock';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private url = "http://localhost:3000/workspaces";
  private onPage = new Subject<Partial<Page>>();
  changePage$ = this.onPage.asObservable();

  private onToggle = new Subject();
  changePageMenu$ = this.onToggle.asObservable();



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

  onChange(page: Partial<Page>): void {
    this.onPage.next(page);
  }

  onChangeMenu(type: string): void {
    this.onToggle.next(type);
  }

  postPage(formData: Partial<Page>, id: string): Observable<Page> {
    const postData = {"data":formData}
    const url = `${this.url}/${id}/pages`
    return this.http.post<{data:Page}>(url, postData , this.httpOptions)
      .pipe(
        map((results:{data:Page})=> results.data as Page),
        catchError( this.errorHandlerService.handleError<Page>('postPage'))
      );
  }

  getPages(id: string): Observable<Page[]> {
    const url = `${this.url}/${id}/pages`
    return this.http.get<{data:Page[]}>(url, this.httpOptions)
      .pipe(
        map((results:{data:Page[]})=> results.data as Page[]),
        catchError( this.errorHandlerService.handleError<Page[]>('getPages', []))
      );
  }

  getPage(wsid: string, pid: string): Observable<Page> {
    const url = `${this.url}/${wsid}/pages/${pid}`;
    return this.http.get<{data:Page}>(url, this.httpOptions)
      .pipe(
        map((results: {data:Page}) => results.data as Page),
        catchError( this.errorHandlerService.handleError<Page>('getPage'))
      );
  }

  patchPage(formData: Partial<Page>, wsid: string, pid: string):  Observable<Page> {
    const patchData = {"data":formData}
    const url = `${this.url}/${wsid}/pages/${pid}`;
    return this.http.patch<{data:Page}>(url, patchData , this.httpOptions)
      .pipe(
        map((results:{data:Page})=> results.data as Page),
        catchError( this.errorHandlerService.handleError<Page>('patchPage'))
      );
  }

  patchPageCover(formData: Partial<Page>, wsid: string, pid: string): Observable<Page> {
    let patchData = new FormData();
    patchData.append("image", formData.cover!, `pagecover_${pid}`)
    const url = `${this.url}/${wsid}/pages/${pid}/`;
    return this.http.patch<{data:Page}>(url, patchData , this.httpOptionsImg)
      .pipe(
        map((results:{data:Page})=> results.data as Page),
        catchError( this.errorHandlerService.handleError<Page>('patchPageCover'))
      );
  }

  patchPageIcon(formData: Partial<Page>, wsid: string, pid: string): Observable<Page> {
    let patchData = new FormData();
    patchData.append("image", formData.icon!, `pageicon_${pid}`)
    const url = `${this.url}/${wsid}/pages/${pid}/`;
    return this.http.patch<{data:Page}>(url, patchData , this.httpOptionsImg)
      .pipe(
        map((results:{data:Page})=> results.data as Page),
        catchError( this.errorHandlerService.handleError<Page>('patchPageIcon'))
      );
  }

  patchPageOrder(formData: Partial<Page>, wsid: string): Observable<Page> {
    const patchData = {"data":formData}
    const url = `${this.url}/${wsid}/pages/`;
    return this.http.patch<{data:Page}>(url, patchData , this.httpOptions)
      .pipe(
        map((results:{data:Page})=> results.data as Page),
        catchError( this.errorHandlerService.handleError<Page>('patchPageOrder'))
      );
  }

  deletePage(wsid: string, pid: string): Observable<Page[]> {
    const url = `${this.url}/${wsid}/pages/${pid}/`;
    return this.http.delete<{data: Page[]}>(url, this.httpOptions)
      .pipe(
        map((results:{data:Page[]})=> results.data as Page[]),
        catchError( this.errorHandlerService.handleError<Page[]>('deletePage'))
      );
  }

  searchPage(wsid: string, term: string): Observable<Search[]> {
    const url =  `${this.url}/${wsid}/pages?term=${term}`; 
    return this.http.get<{data: Search[]}>( url, this.httpOptions)
      .pipe(
        map((results:{data:Search[]})=> results.data as Search[]),
        catchError( this.errorHandlerService.handleError<Search[]>('searchPage'))
      )
  }

  getPublicPage(pid: string): Observable<PageBlock[]> {
    const url = `http://localhost:3000/pages/${pid}`
    return this.http.get<{data:PageBlock[]}>(url, this.httpOptions)
      .pipe(
        map((results:{data:PageBlock[]})=> results.data as PageBlock[]),
        catchError( this.errorHandlerService.handleError<PageBlock[]>('getPageBlocks', []))
      );
  }
}
