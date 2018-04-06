import { Injectable, Component, Input, Output, EventEmitter } from '@angular/core';

@Injectable()
export class GlobalStoreService {
  @Output() titleChanged: EventEmitter<any> = new EventEmitter();

  private _title = 'IQB-Testcenter - Willkommen';
  private _loginToken = '';

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
}
