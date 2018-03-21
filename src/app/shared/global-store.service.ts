import { Injectable, Component, Input, Output, EventEmitter } from '@angular/core';

@Injectable()
export class GlobalStoreService {
  @Output() titleChanged: EventEmitter<any> = new EventEmitter();
  @Output() sessionStatusChanged: EventEmitter<any> = new EventEmitter();
  @Output() navPrevEnabledChanged: EventEmitter<any> = new EventEmitter();
  @Output() navNextEnabledChanged: EventEmitter<any> = new EventEmitter();

  private _title = 'IQB-Testcenter - Willkommen';
  private _navPrevEnabled = false;
  private _navNextEnabled = false;
  private _loginToken = '';
  private _sessionToken = '';

  public readonly appName = 'IQB OpenCBA Testcenter';
  public readonly appPublisher = 'IQB - Institut zur Qualitätsentwicklung im Bildungswesen';
  public readonly appVersion = '0.1.1/20.2.2018';

  // title __________________________________________________
  set title(newTitle: string) {
    if (newTitle !== this._title) {
      this._title = newTitle;
      this.titleChanged.emit(newTitle);
    }
  }
  get title(): string {
    return this._title;
  }

  public isSession(): boolean {
    return this._sessionToken.length > 0;
  }

  // tokens __________________________________________________
  set loginToken(newToken: string) {
    if (newToken !== this._loginToken) {
      localStorage.setItem('lt', newToken);
      this._loginToken = newToken;
    }
  }
  get loginToken(): string {
    if (this._loginToken.length === 0) {
      this._loginToken = localStorage.getItem('lt');
    }
    return this._loginToken;
  }
  set sessionToken(newToken: string) {
    if (newToken !== this._sessionToken) {
      localStorage.setItem('st', newToken);
      this._sessionToken = newToken;
      this.sessionStatusChanged.emit(this.isSession);
    }
  }
  get sessionToken(): string {
    if (this._sessionToken.length === 0) {
      this._sessionToken = localStorage.getItem('st');
    }
    return this._sessionToken;
  }

  // NavPrevEnabled/NavNextEnabled __________________________
  get navPrevEnabled(): boolean {
    return this._navPrevEnabled;
  }

  get navNextEnabled(): boolean {
    return this._navNextEnabled;
  }

  set navPrevEnabled(isEnabled: boolean) {
    if (isEnabled !== this._navPrevEnabled) {
      this._navPrevEnabled = isEnabled;
      this.navPrevEnabledChanged.emit(isEnabled);
    }
  }

  set navNextEnabled(isEnabled: boolean) {
    if (isEnabled !== this._navNextEnabled) {
      this._navNextEnabled = isEnabled;
      this.navNextEnabledChanged.emit(isEnabled);
    }
  }
}
