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
  private serverUrl = 'http://ocba.iqb.hu-berlin.de/';

  constructor(private http: HttpClient) { }

  private errorHandler(error: Error | any): Observable<any> {
    return Observable.throw(error);
  }

  // *******************************************************************
  login(name: string, password: string): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<string>(this.serverUrl + 'loginAdmin.php', {n: name, p: password}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // *******************************************************************
  logout(token: string): Observable<boolean> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<boolean>(this.serverUrl + 'logoutAdmin.php', {at: token}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // *******************************************************************
  getStatus(token: string): Observable<LoginStatusResponseData> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<LoginStatusResponseData>(this.serverUrl + 'getStatusAdmin.php', {at: token}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }


  // *******************************************************************
  // Fehlerbehandlung beim Aufrufer
  getFiles(token: string, workspaceId: number): Observable<GetFileResponseData[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<GetFileResponseData[]>(this.serverUrl + 'getFileList.php', {at: token, ws: workspaceId}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // *******************************************************************
  // Fehlerbehandlung beim Aufrufer
  deleteFiles(token: string, workspaceId: number, filesToDelete: Array<string>): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<string>(this.serverUrl + 'deleteFiles.php', {at: token, ws: workspaceId, f: filesToDelete}, httpOptions)
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

export interface LoginStatusResponseData {
  isValidLogin: boolean;
  admintoken: string;
  name: string;
  workspaces: WorkspaceData[];
}

export interface WorkspaceData {
  id: number;
  name: string;
}

export interface GetFileResponseData {
  filename: string;
  filesize: number;
  filesizestr: string;
  filedatetime: string;
  filedatetimestr: string;
  type: string;
  typelabel: string;
  isChecked: boolean;
}
