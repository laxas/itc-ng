import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class BackendService {
  private serverUrl = 'http://ocba2.iqb.hu-berlin.de/';

  constructor(private http: HttpClient) { }

  getStatus(admintoken: string, logintoken: string, sessiontoken: string): Observable<LoginResponseData> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<LoginResponseData>(this.serverUrl + 'getStatus.php', {at: admintoken, lt: logintoken, st: sessiontoken}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

  testlogin(name: string, password: string): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<string>(this.serverUrl + 'testlogin.php', {n: name, p: password}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  getSessions(token: string): Observable<GetSessionsResponseData> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<GetSessionsResponseData>(this.serverUrl + 'getSessions.php', {lt: token}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  getBooklet(token: string, bookletId: string): Observable<GetBookletResponseData> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<GetBookletResponseData>(this.serverUrl + 'getBooklet.php', {lt: token}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
}

  startSession(token: string, code: string, bookletFilename: string): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<string>(this.serverUrl + 'startSession.php', {lt: token, c: code, b: bookletFilename}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
}

  // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

  private handleError(errorObj: HttpErrorResponse) {
    let myreturn = 'Fehler bei Datenübertragung';
    if (errorObj.status === 401) {
      myreturn = 'Fehler: Zugriff verweigert - bitte (neu) anmelden!';
    } else if (errorObj.status === 503) {
      myreturn = 'Fehler: Server meldet Datenbankproblem.';
    } else if (errorObj.error instanceof ErrorEvent) {
      myreturn = 'Fehler: ' + (<ErrorEvent>errorObj.error).message;
    } else {
      myreturn = 'Fehler: ' + errorObj.message;
    }

    return new ErrorObservable(myreturn);
  }
}


// #############################################################################################

export interface LoginResponseData {
  t: string;
  n: string;
  ws: string;
}

export interface SessionData {
  name: string;
  codes: string[];
  filename: string;
  title: string;
}

export interface GetSessionsResponseData {
  mode: string;
  ws: string;
  sessions: SessionData[];
}

export interface GetBookletResponseData {
  label: string;
}
