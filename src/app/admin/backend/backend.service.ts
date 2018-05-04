import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class BackendService {

  constructor(
    @Inject('SERVER_URL') private serverUrl: string,
    private http: HttpClient) { }

  private errorHandler(error: Error | any): Observable<any> {
    return Observable.throw(error);
  }

  // *******************************************************************
  login(name: string, password: string): Observable<LoginStatusResponseData | ServerError> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<LoginStatusResponseData>(this.serverUrl + 'loginAdmin.php', {n: name, p: password}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // *******************************************************************
  logout(token: string): Observable<boolean | ServerError> {
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
  getStatus(token: string): Observable<LoginStatusResponseData | ServerError> {
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
  getFile(token: string, workspaceId: number, filetype: string, filename: string): Observable<GetFileResponseData[] | ServerError> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<GetFileResponseData[]>(this.serverUrl + 'getFile.php', {
            at: token,
            ws: workspaceId,
            ft: filetype,
            fn: filename
          }, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // *******************************************************************
  // Fehlerbehandlung beim Aufrufer
  getFiles(token: string, workspaceId: number): Observable<GetFileResponseData[] | ServerError> {
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
  deleteFiles(token: string, workspaceId: number, filesToDelete: Array<string>): Observable<string | ServerError> {
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
  private handleError(errorObj: HttpErrorResponse): Observable<ServerError> {
    const myreturn: ServerError = {
      label: 'Fehler bei Datenübertragung',
      code: errorObj.status
    };
    if (errorObj.status === 401) {
      myreturn.label = 'Fehler: Zugriff verweigert - bitte (neu) anmelden!';
    } else if (errorObj.status === 503) {
      myreturn.label = 'Fehler: Server meldet Datenbankproblem.';
    } else if (errorObj.error instanceof ErrorEvent) {
      myreturn.label = 'Fehler: ' + (<ErrorEvent>errorObj.error).message;
    } else {
      myreturn.label = 'Fehler: ' + errorObj.message;
    }

    return new ErrorObservable(myreturn);
  }
}


// #############################################################################################

export interface LoginStatusResponseData {
  admintoken: string;
  name: string;
  workspaces: WorkspaceData[];
}

export interface WorkspaceData {
  id: number;
  name: string;
}

export interface ServerError {
  code: number;
  label: string;
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
