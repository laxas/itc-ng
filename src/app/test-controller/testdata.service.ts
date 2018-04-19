import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReactiveFormsModule } from '@angular/forms';
import 'rxjs/add/observable/from';
import { Observable } from 'rxjs/Observable';
import { BackendService, GetXmlResponseData, ServerError } from './backend.service';
import { Injectable, Component, Input, Output, EventEmitter, Pipe } from '@angular/core';
import { Element } from '@angular/compiler';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TestdataService {
  public pageTitle$ = new BehaviorSubject<string>('Lade Seite...');
  public navPrevEnabled$ = new BehaviorSubject<boolean>(false);
  public navNextEnabled$ = new BehaviorSubject<boolean>(false);
  public isSession$ = new BehaviorSubject<boolean>(false);
  public statusmessage$ = new BehaviorSubject<string>('Bitte warten!');
  public bookletname$ = new BehaviorSubject<string>('-');

  get sessionToken(): string {
    return this._sessionToken;
  }


  // .................................................................................
  private _sessionToken = '';
  private allUnits: UnitDef[] = [];
  private currentUnitId$ = new BehaviorSubject<number>(0);

  // ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
  constructor(
    private bs: BackendService,
    private router: Router
  ) {
    this._sessionToken = localStorage.getItem('st');
    if (this._sessionToken === null) {
      this._sessionToken = '';
    }
    if (this._sessionToken === '') {
      this.isSession$.next(false);
    } else {
      this.isSession$.next(true);
    }

    this.currentUnitId$.subscribe(myUnitId => {
      this.navPrevEnabled$.next(myUnitId > 0);
      this.navNextEnabled$.next((myUnitId >= 0) && (myUnitId < this.allUnits.length - 1));
    });
  }

  getUnitAt (unitId: any): UnitDef {
    const unitIdNumber = Number(unitId);
    if (Number.isNaN(unitId) || (unitId < 0) || (unitId >= this.allUnits.length)) {
      return null;
    } else {
      return this.allUnits[unitId];
    }
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  getUnitId(target: string): number {
    let myUnitId = this.currentUnitId$.getValue();

    if (this.allUnits.length > 0) {
      switch (target) {
        case 'next':
          if (myUnitId < this.allUnits.length - 1) {
            myUnitId = myUnitId + 1;
          }
          break;

        case 'prev':
          if (myUnitId > 0) {
            myUnitId = myUnitId - 1;
          }
          break;

        case 'first':
          myUnitId = 0;
          break;

        case 'last':
          myUnitId = this.allUnits.length - 1;
          break;

        default:
          myUnitId = -1;
          break;
      }
    } else {
      myUnitId = -1;
    }
    return myUnitId;
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  public gotoPrevUnit() {
    this.gotoUnit(this.getUnitId('prev'));
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  public gotoNextUnit() {
    this.gotoUnit(this.getUnitId('next'));
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  private gotoUnit(newUnitId) {
    if ((newUnitId >= 0) && (newUnitId < this.allUnits.length)) {
      this.router.navigateByUrl('/t/u/' + newUnitId);
    } else {
      this.router.navigateByUrl('/t/u/x');
    }
  }

  // /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
  // app.component.ngOnInit sets a listener on 'message'-event.
  processMessagePost(postData) {
    console.log('TestdataService.processMessagePost:');
    console.log(postData);
  }


  updateSessionToken(newToken: string) {
    this._sessionToken = newToken;
    if ((newToken !== null) && (newToken.length > 0)) {
      localStorage.setItem('st', newToken);
      this.isSession$.next(true);
    } else {
      localStorage.removeItem('st');
      this.isSession$.next(false);
    }
  }

  updateBookletData(bookletname: string, units: UnitDef[], message: string) {
    this.allUnits = units;
    this.bookletname$.next(bookletname);
    this.statusmessage$.next(message);
    this.gotoUnit(this.getUnitId('first'));
  }

  updatePageTitle(newTitle: string) {
    this.pageTitle$.next(newTitle);
  }

  updateUnitId(newUnitId: number) {
    if ((newUnitId >= 0) && (newUnitId < this.allUnits.length)) {
      this.currentUnitId$.next(newUnitId);
    } else {
      this.currentUnitId$.next(-1);
    }
  }
}



// .....................................................................
export class Testlet {
  private _testlets: Testlet[];
  private _units: string;
  constructor() {

  }

}

// .....................................................................
export interface NavigationPoint {
  title: string;
  unitId: number;
  path: string;
}

// .....................................................................
export class ResourceStore {

}

// .....................................................................
export class ResourceData {
  name: string;
  alias: string;
  type: string;
  dataString: string;

  constructor(name: string, alias: string) {
    if ((typeof name === 'undefined') || (name == null)) {
      name = '';
    }
    if ((typeof alias === 'undefined') || (alias == null)) {
      alias = '';
    }

    if ((name + alias).length === 0) {
      this.name = '?';
      this.alias = '?';
    } else {
      if (name.length === 0) {
        this.name = alias;
      } else {
        this.name = name;
      }
      if (alias.length === 0) {
        this.alias = name;
      } else {
        this.alias = alias;
      }
    }
  }
}

// .....................................................................
export class UnitDef {
  sequenceId: number;
  name: string;
  title: string;
  resources: ResourceData[];
  restorePoint: string;
  dataForItemplayer: string;

  constructor(name: string, title: string) {
    this.name = name;
    this.title = title;
    this.resources = [];
    this.restorePoint = '';
    this.dataForItemplayer = '';
  }

  getItemplayerHtml() {
    for (let i = 0; i < this.resources.length; i++) {
      if (this.resources[i].type === 'itemplayer_html') {
        if (this.resources[i].dataString.length > 0) {
          return this.resources[i].dataString;
        }
      }
    }
    return null;
  }
}
