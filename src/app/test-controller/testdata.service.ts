import { ReactiveFormsModule } from '@angular/forms';
import 'rxjs/add/observable/from';
import { Observable } from 'rxjs/Observable';
import { BackendService, GetXmlResponseData, ServerError } from './backend.service';
import { Injectable, Component, Input, Output, EventEmitter, Pipe } from '@angular/core';
import { Element } from '@angular/compiler';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class TestdataService {
  @Output() currentUnitChanged: EventEmitter<any> = new EventEmitter();
  @Output() currentNavigationPointChanged: EventEmitter<any> = new EventEmitter();
  @Output() problemArising: EventEmitter<any> = new EventEmitter();
  @Output() titleChanged: EventEmitter<any> = new EventEmitter();
  @Output() sessionStatusChanged: EventEmitter<any> = new EventEmitter();
  @Output() navPrevEnabledChanged: EventEmitter<any> = new EventEmitter();
  @Output() navNextEnabledChanged: EventEmitter<any> = new EventEmitter();

  private _sessionToken = '';
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
  get isSession(): boolean {
    return this._sessionToken.length > 0;
  }

  private _unitTitle = '';
  set unitTitle(newTitle: string) {
    if (newTitle !== this._unitTitle) {
      this._unitTitle = newTitle;
      this.titleChanged.emit(this.unitTitle);
    }
  }
  get unitTitle(): string {
    return this._unitTitle;
  }

  // NavPrevEnabled/NavNextEnabled __________________________
  private _navPrevEnabled = false;
  get navPrevEnabled(): boolean {
    return this._navPrevEnabled;
  }
  set navPrevEnabled(isEnabled: boolean) {
    if (isEnabled !== this._navPrevEnabled) {
      this._navPrevEnabled = isEnabled;
      this.navPrevEnabledChanged.emit(isEnabled);
    }
  }

  private _navNextEnabled = false;
  get navNextEnabled(): boolean {
    return this._navNextEnabled;
  }
  set navNextEnabled(isEnabled: boolean) {
    if (isEnabled !== this._navNextEnabled) {
      this._navNextEnabled = isEnabled;
      this.navNextEnabledChanged.emit(isEnabled);
    }
  }


  private _currentUnit: UnitDef;
  get currentUnit(): UnitDef {
    return this._currentUnit;
  }

  private _currentNavigationPoint: NavigationPoint;
  get currentNavigationPoint(): NavigationPoint {
    return this._currentNavigationPoint;
  }

  get unitcount(): number {
    return this.allUnits.length;
  }

  private _isProblem: boolean;
  get isProblem(): boolean {
    return this._isProblem;
  }
  set isProblem(p: boolean) {
    this._isProblem = p;
    if (p) {
      this._problemMessage = 'Es ist ein Problem aufgetaucht.';
      this.problemArising.emit(this._problemMessage);
    } else {
      this._problemMessage = '';
    }
  }

  private _problemMessage: string;
  get problemMessage(): string {
    return this._problemMessage;
  }
  set problemMessage(msg: string) {
    this._problemMessage = msg;
    if (msg.length > 0) {
      this._isProblem = true;
      this.problemArising.emit(this._problemMessage);
    } else {
      this._isProblem = false;
    }
  }


  // private private private private private private private private
  private allUnits: UnitDef[];
  private bookletname: string;
  private unitCount: number;

  constructor(
    private bs: BackendService
  ) {
    this._currentUnit = null;
    this._currentNavigationPoint = null;
    this.allUnits = [];
    this.bookletname = '#booklet';
    this.unitCount = 0;
    this._unitTitle = 'Lade Seite...';
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  private setCurrentUnit(newUnitId: number) {
    this.isProblem = false;
    if (newUnitId < 0) {
      this._currentUnit = null;
    } else {
      this._currentUnit = this.allUnits[newUnitId];
      this.navNextEnabled = newUnitId < this.unitcount - 1;
      this.navPrevEnabled = newUnitId > 0;
    }
    this.currentUnitChanged.emit(this._currentUnit);
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  public gotoPrevUnit() {
    if (this.currentUnit !== null) {
      const thisUnitNumber = this.currentUnit.sequenceId;
      if (thisUnitNumber > 0) {
        this.setCurrentUnit(thisUnitNumber - 1);
      }
    }
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  public gotoNextUnit() {
    if (this.currentUnit !== null) {
      const thisUnitNumber = this.currentUnit.sequenceId;
      if (thisUnitNumber < this.unitcount - 1) {
        this.setCurrentUnit(thisUnitNumber + 1);
      }
    }
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  loadBookletDefinition() {
    this.bs.getBooklet(this.sessionToken).subscribe(
      (bdata: GetXmlResponseData) => {
        // Create Unit-List
        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(bdata.xml, 'text/xml');
        if (oDOM.documentElement.nodeName === 'Booklet') {
          // ________________________
          const metadataElements = oDOM.documentElement.getElementsByTagName('Metadata');
          if (metadataElements.length > 0) {
            const metadataElement = metadataElements[0];
            const NameElement = metadataElement.getElementsByTagName('Name')[0];
            this.bookletname = NameElement.textContent;
          }

          // ________________________
          const unitsElements = oDOM.documentElement.getElementsByTagName('Units');
          if (unitsElements.length > 0) {
            const unitsElement = unitsElements[0];
            const unitList = unitsElement.getElementsByTagName('Unit');
            this.unitCount = unitList.length;
            for (let i = 0; i < this.unitCount; i++) {
              this.allUnits[i] = new UnitDef(unitList[i].getAttribute('name'), unitList[i].getAttribute('title'));
              this.allUnits[i].sequenceId = i;
            }

            // triggers testcontroller to load unit
            this.setCurrentUnit(0);
          }
        }
      }, (err: ServerError) => {
        this.problemMessage = err.label;
        this._currentUnit = null;
        this._currentNavigationPoint = null;
        this.allUnits = [];
        this.bookletname = '#booklet';
      }
    );
  }

  // /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
  // app.component.ngOnInit sets a listener on 'message'-event.
  processMessagePost(postData) {
    console.log('TestdataService.processMessagePost');
    console.log(postData);
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
      console.log('>>' + this.resources[i].type);
      if (this.resources[i].type === 'itemplayer_html') {
        if (this.resources[i].dataString.length > 0) {
          return this.resources[i].dataString;
        }
      }
    }
    return null;
  }
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
