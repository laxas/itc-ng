import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { ResponseContentType } from '@angular/http';
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

  // 888888888888888888888888888888888888888888888888888888888888888888
  getBooklet(sessiontoken: string): Observable<GetXmlResponseData> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<GetXmlResponseData>(this.serverUrl + 'getBooklet.php', {st: sessiontoken}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // 888888888888888888888888888888888888888888888888888888888888888888
  getUnit(sessiontoken: string, unitid: string): Observable<GetXmlResponseData> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<GetXmlResponseData>(this.serverUrl + 'getUnit.php', {st: sessiontoken, u: unitid}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // 888888888888888888888888888888888888888888888888888888888888888888
  getUnitResource(sessiontoken: string, resId: string): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      responseType: ResponseContentType.ArrayBuffer
    };
    return this.http
      .post<Response>(this.serverUrl + 'getUnitResource.php', {st: sessiontoken, r: resId}, httpOptions)
        .pipe(
          catchError(this.handleError)
        )
        .map((r: ArrayBuffer) => {
            let str64 = '';
            const alen = r.byteLength;
            for (let i = 0; i < alen; i++) {
              str64 += String.fromCharCode(r[i]);
            }
            return window.btoa(str64);
        });
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

export interface GetXmlResponseData {
  xml: string;
  status: string;
}
