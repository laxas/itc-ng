import { UnitData } from './unitdata';
import 'rxjs/add/observable/from';
import { Observable } from 'rxjs/Observable';
import { GlobalStoreService } from './../shared/global-store.service';
import { BackendService, GetXmlResponseData } from './backend.service';
import { Injectable, Component, Input, Output, EventEmitter, Pipe } from '@angular/core';
import { Element } from '@angular/compiler';
import { mergeMap } from 'rxjs/operators';

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
  private maxUnitPointer: number;




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
      this._currentUnit.load();
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
            this.maxUnitPointer = unitList.length;
            for (let i = 0; i < unitList.length; i++) {
              this.allUnits[i + 1] = new UnitData(unitList[i], this.gss, this.bs);
            }

            // load resources

            // = = = = = = = = = = = = = = =
            //  = = = = = = = = = = = = = =
            // set current situation
            this.unitPointer = 3;

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


  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  getUnit( unitId: string ): Observable<UnitDef> {
    return this.bs.getUnit(this.gss.sessionToken, unitId).map(
      (udata: GetXmlResponseData) => {
        const myReturn = new UnitDef(unitId);
        myReturn.restorePoint = udata.status;

        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(udata.xml, 'text/xml');
        if (oDOM.documentElement.nodeName === 'Unit') {
          // ________________________
          const dataElements = oDOM.documentElement.getElementsByTagName('Data');
          if (dataElements.length > 0) {
            const dataElement = dataElements[0];
            myReturn.dataForItemplayer = dataElement.textContent;
          }

          // ________________________
          const resourcesElements = oDOM.documentElement.getElementsByTagName('Resources');
          if (resourcesElements.length > 0) {
            const resourcesElement = resourcesElements[0];
            const rList = resourcesElement.getElementsByTagName('Resource');
            for (let i = 0; i < rList.length; i++) {
              const myResource = new ResourceData(rList[i].textContent, rList[i].getAttribute('alias'));
              myResource.type = rList[i].getAttribute('type');
              myReturn.resources[myResource.alias] = myResource;
              console.log(myResource);
            }
          }
        }

        return myReturn;
      }
    );
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  fetchAllUnitResources( udef: UnitDef ): Observable<UnitDef> {
    return from(udef.resources).pipe(
      mergeMap((res: ResourceData) => <Observable<string>>
        this.bs.getUnitResource(this.gss.sessionToken, this.res)
      )
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

// .....................................................................
export class UnitDef {
  name: string;
  resources: ResourceData[];
  restorePoint: string;
  dataForItemplayer: string;

  constructor(name: string) {
    this.name = name;
    this.resources = [];
    this.restorePoint = '';
    this.dataForItemplayer = '';
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
