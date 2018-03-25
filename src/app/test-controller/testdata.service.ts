import { UnitData } from './unitdata';
import { Observable } from 'rxjs/Observable';
import { GlobalStoreService } from './../shared/global-store.service';
import { BackendService, GetXmlResponseData } from './backend.service';
import { Injectable, Component, Input, Output, EventEmitter } from '@angular/core';
import { Element } from '@angular/compiler';


@Injectable()
export class TestdataService {
  @Output() currentUnitChanged: EventEmitter<any> = new EventEmitter();
  @Output() currentNavigationPointChanged: EventEmitter<any> = new EventEmitter();

  private _currentUnit: UnitData;
  get currentUnit(): UnitData {
    return this._currentUnit;
  }

  private _currentNavigationPoint: NavigationPoint;
  get currentNavigationPoint(): NavigationPoint {
    return this._currentNavigationPoint;
  }

  get unitcount(): number {
    return this.allUnits.length;
  }

  private _errorMessage: string;
  get errorMessage(): string {
    return this._errorMessage;
  }

  // private private private private private private private private
  private allUnits: UnitData[];
  private bookletname: string;
  private unitPointer: number; // '0' stands for no unit to point at




  constructor(
    private gss: GlobalStoreService,
    private bs: BackendService
  ) {
    this._currentUnit = null;
    this._currentNavigationPoint = null;
    this.allUnits = [];
    this.bookletname = '#booklet';
    this.unitPointer = 0;
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  private setCurrentUnit(newUnitId: number) {
    this._errorMessage = '';
    if (newUnitId === 0) {
      this._currentUnit = null;
    } else {
      this._currentUnit = this.allUnits[newUnitId];
    }
    this.currentUnitChanged.emit(this._currentUnit);
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  private setCurrentNavigationPoint(newNavigationPoint: NavigationPoint) {
    this._currentNavigationPoint = newNavigationPoint;
    this.currentNavigationPointChanged.emit(newNavigationPoint);
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  loadBookletDefinition() {
    this.bs.getBooklet(this.gss.sessionToken).subscribe(
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
            for (let i = 0; i < unitList.length; i++) {
              this.allUnits[i + 1] = new UnitData(unitList[i], this.gss, this.bs);
            }

            // load resources

            // = = = = = = = = = = = = = = =
            //  = = = = = = = = = = = = = =
            // set current situation
            this.unitPointer = 2;

            // triggers ItemplayerComponent to reload
            this.setCurrentUnit(this.unitPointer);
          }
        }
      }, (errormsg: string) => {
        this._currentUnit = null;
        this._currentNavigationPoint = null;
        this.allUnits = [];
        this.bookletname = '#booklet';
      }
    );
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
