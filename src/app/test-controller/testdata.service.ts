import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReactiveFormsModule } from '@angular/forms';
import 'rxjs/add/observable/from';
import { Observable } from 'rxjs/Observable';
import { BackendService, GetXmlResponseData, ServerError } from './backend.service';
import { Injectable, Component, Input, Output, EventEmitter, Pipe } from '@angular/core';
import { Element } from '@angular/compiler';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class TestdataService {
  public pageTitle$ = new BehaviorSubject<string>('Lade Seite...');
  public navPrevEnabled$ = new BehaviorSubject<boolean>(false);
  public navNextEnabled$ = new BehaviorSubject<boolean>(false);
  public isSession$ = new BehaviorSubject<boolean>(false);
  public statusmessage$ = new BehaviorSubject<string>('Bitte warten!');
  public bookletname$ = new BehaviorSubject<string>('-');

  public currentUnit$ = new BehaviorSubject<UnitDef>(null);
  // public currentNavigationPoint$ = new BehaviorSubject<UnitDef>(null);

  get sessionToken(): string {
    return this._sessionToken;
  }


  // .................................................................................
  private _sessionToken = '';
  private allUnits: UnitDef[] = [];


  // ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
  constructor(
    private bs: BackendService
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
  }


  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  gotoUnit(target: any) {
    const myUnit = this.currentUnit$.getValue();
    let newUnit: UnitDef = null;
    let myUnitId = 0;

    if (this.allUnits.length > 0) {
      if (myUnit !== null) {
        myUnitId = myUnit.sequenceId;
      }

      if (typeof target === 'string') {
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
        myUnitId = target;
      }

      if (myUnitId < 0) {
        this.statusmessage$.next('Ungültiger Aufruf: ' + target);
      } else {
        // fetch resources
        newUnit = this.allUnits[myUnitId];

        this.pageTitle$.next(newUnit.title);
        this.currentUnit$.next(null);

        this.bs.getUnit(this._sessionToken, newUnit.name).subscribe(
          (udata: GetXmlResponseData) => {
            console.log('# # # # # # # # # # # # # # #');
            console.log(udata);

            newUnit.restorePoint = udata.status;

            const oParser = new DOMParser();
            const oDOM = oParser.parseFromString(udata.xml, 'text/xml');
            if (oDOM.documentElement.nodeName === 'Unit') {
              // ________________________
              const dataElements = oDOM.documentElement.getElementsByTagName('Data');
              if (dataElements.length > 0) {
                const dataElement = dataElements[0];
                newUnit.dataForItemplayer = dataElement.textContent;
              }

              // ________________________
              const resourcesElements = oDOM.documentElement.getElementsByTagName('Resources');
              if (resourcesElements.length > 0) {
                let ResourceFetchPromises: Promise<number>[];
                ResourceFetchPromises = [];

                const resourcesElement = resourcesElements[0];
                const rList = resourcesElement.getElementsByTagName('Resource');
                for (let i = 0; i < rList.length; i++) {
                  const myResource = new ResourceData(rList[i].textContent, rList[i].getAttribute('name'));
                  myResource.type = rList[i].getAttribute('type');
                  newUnit.resources.push(myResource);

                  // add promise to load all resources at the end
                  if (myResource.type === 'itemplayer_html') {
                    ResourceFetchPromises.push(new Promise((resolve, reject) => {
                      this.bs.getUnitResourceTxt(this._sessionToken, myResource.name).subscribe(
                        (fileAsTxt: string) => {
                          myResource.dataString = fileAsTxt;
                          resolve(myResource.dataString.length);
                        }
                      );
                    }));
                  } else {
                    ResourceFetchPromises.push(new Promise((resolve, reject) => {
                      this.bs.getUnitResource64(this._sessionToken, myResource.name).subscribe(
                        (fileAsBase64: string) => {
                          myResource.dataString = fileAsBase64;
                          resolve(myResource.dataString.length);
                        }
                      );
                    }));
                  }
                }
                Promise.all(ResourceFetchPromises)
                  .then(promisesReturnValues => {
                    this.currentUnit$.next(newUnit);
                  });
              } else {
                this.currentUnit$.next(newUnit);
              }
            }
          }
        );
      }
    }

    // - - - - - - - - - - - - - - - -
    if (newUnit === null) {
      this.pageTitle$.next('Aufgabe');
      this.navNextEnabled$.next(false);
      this.navPrevEnabled$.next(false);
    } else {
      this.pageTitle$.next(newUnit.title);
      this.navNextEnabled$.next(myUnitId < this.allUnits.length - 1);
      this.navPrevEnabled$.next(myUnitId > 0);
    }
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  public gotoPrevUnit() {
    this.gotoUnit('prev');
  }

  // + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
  public gotoNextUnit() {
    this.gotoUnit('next');
  }

  // /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
  // app.component.ngOnInit sets a listener on 'message'-event.
  processMessagePost(postData) {
    console.log('TestdataService.processMessagePost');
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
    this.gotoUnit('first');
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
