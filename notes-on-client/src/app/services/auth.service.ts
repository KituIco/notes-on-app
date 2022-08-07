import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { HttpClient, HttpHeaders, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable, BehaviorSubject } from "rxjs";
import { first, tap, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

import { AuthResponse, User } from '../interfaces/user';
import { ErrorHandlerService } from './error-handler.service';


@Injectable({ providedIn: 'root' })
export class AuthService implements CanActivate, HttpInterceptor {
  private url = "http://localhost:3000/users";
  
  httpOptions: {headers: HttpHeaders} = {
    headers: new HttpHeaders({ "Content-type": "application/json" })
  }

  constructor(
    private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
    private router: Router,
    private cookie: CookieService,
  ) { }

  signup(user: Omit<User, "id"|"totalWorkspaces">): Observable<User> {
    return this.http.post<User>(this.url,{data:user},this.httpOptions)
      .pipe(
        first(),
        tap(() => this.router.navigate(["login"])),
        catchError(this.errorHandlerService.handleError<User>("signup")),
      )
  }
  
  login(email: Pick<User,"email">, password: Pick<User,"password">): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`,{data:{email,password}},this.httpOptions)
      .pipe(
        first(),
        tap((tokenObject:AuthResponse)=> {
          let expiredDate = new Date();
          expiredDate.setDate( expiredDate.getDate() + 1 );
          this.cookie.set("authData", JSON.stringify({
            "userId": tokenObject.data.userId,
            "token":  tokenObject.data.token,
            "logged": true
          }), expiredDate);
          this.router.navigate(["dashboard"]);
        }),
        catchError(
          this.errorHandlerService.handleError<AuthResponse>("login")
        )
      );
  }

  logout(): void {
    this.cookie.delete("authData","/")
    this.router.navigate(["login"]);
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const authData = JSON.parse(this.cookie.get("authData") || '{}')
    if(route.routeConfig && ['login','','signup'].includes(route.routeConfig.path||"")){
      if (authData.logged) {
        this.router.navigate(["dashboard"]);
      } return !authData.logged;
    }
    if (!authData.logged) {
      this.router.navigate(["login"]);
    } return authData.logged;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authData = JSON.parse(this.cookie.get("authData") || '{}')
    if (authData.token) {
      const clonedRequest = req.clone({
        headers: req.headers.set("Authorization", "Bearer " + authData.token),
      });
      return next.handle(clonedRequest);
    } else {
      return next.handle(req);
    }
  }
}
