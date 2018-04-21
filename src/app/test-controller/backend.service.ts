import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';

@Injectable()
export class BackendService {

  private serverUrl = 'http://ocba.iqb.hu-berlin.de/';
  private unitCache: GetXmlResponseData[] = [];
  private lastBookletState = '';

  constructor(private http: HttpClient) { }

  // 888888888888888888888888888888888888888888888888888888888888888888
  getStatus(sessiontoken: string): Observable<GetXmlResponseData | ServerError> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http
      .post<GetXmlResponseData>(this.serverUrl + 'getStatusSession.php', {st: sessiontoken}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // 888888888888888888888888888888888888888888888888888888888888888888
  setBookletStatus(sessiontoken: string, state: {}): Observable<GetXmlResponseData | ServerError> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    if ((sessiontoken + JSON.stringify(state)) === this.lastBookletState) {
      return Observable.of(null);
    } else {
      this.lastBookletState = sessiontoken + JSON.stringify(state);
      return this.http
      .post<GetXmlResponseData>(this.serverUrl + 'setBookletStatus.php', {st: sessiontoken, state: state}, httpOptions)
        .pipe(
          catchError(this.handleError)
        );
    }
  }

  // 888888888888888888888888888888888888888888888888888888888888888888
  getUnit(sessiontoken: string, unitid: string): Observable<GetXmlResponseData | ServerError> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    const myUnitdata = this.unitCache[unitid];
    if (typeof myUnitdata === 'undefined') {
      return this.http
      .post<GetXmlResponseData>(this.serverUrl + 'getUnit.php', {st: sessiontoken, u: unitid}, httpOptions)
        .do(r => {
          this.unitCache[unitid] = r;
        })
        .pipe(
          catchError(this.handleError)
        );
    } else {
      return new Observable (observer => {
        observer.next(myUnitdata);
        observer.complete();
      });
    }
  }

  // 888888888888888888888888888888888888888888888888888888888888888888
  getUnitResource(sessiontoken: string, resId: string): Observable<string | ServerError> {
    const myHttpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json'
          }),
          responseType: 'arraybuffer' as 'json'
      };

      return this.http
      .post<ArrayBuffer>(this.serverUrl + 'getUnitResource.php', {st: sessiontoken, r: resId}, myHttpOptions)
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
  // 888888888888888888888888888888888888888888888888888888888888888888
  getUnitResource64(sessiontoken: string, resId: string): Observable<string | ServerError> {
    const myHttpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json'
          }),
          responseType: 'text' as 'json'
      };

      return this.http
      .post<string>(this.serverUrl + 'getUnitResource64.php', {st: sessiontoken, r: resId}, myHttpOptions)
        .pipe(
          catchError(this.handleError)
        );
  }

  // 888888888888888888888888888888888888888888888888888888888888888888
  getUnitResourceTxt(sessiontoken: string, resId: string): Observable<string | ServerError> {
    const myHttpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json'
          }),
          responseType: 'text' as 'json'
      };

      return this.http
      .post<string>(this.serverUrl + 'getUnitResourceTxt.php', {st: sessiontoken, r: resId}, myHttpOptions)
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

export interface GetXmlResponseData {
  xml: string;
  status: {};
}

export interface ServerError {
  code: number;
  label: string;
}
