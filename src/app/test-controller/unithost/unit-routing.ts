import { ResourceData } from './../testdata.service';
import { GetXmlResponseData, BackendService } from './../backend.service';
import { UnithostComponent } from './unithost.component';
import { Injectable, Component } from '@angular/core';
import { CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/Observable/of';
import { UnitDef, TestdataService } from '../testdata.service';

@Injectable()
export class UnitActivateGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      console.log('UnitActivateGuard');
    return true;
  }
}

@Injectable()
export class UnitDeactivateGuard implements CanDeactivate<UnithostComponent> {
  canDeactivate(
    component: UnithostComponent,
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      console.log('UnitDeactivateGuard');
    return true;
  }
}

@Injectable()
// enriches the routing data with unit data and resources:
// places in data['unit'] the unit object
export class UnitResolver implements Resolve<UnitDef> {
  constructor(private tss: TestdataService,
  private bs: BackendService) { }

  resolve(next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<UnitDef> {
      const newUnit = this.tss.getUnitAt(next.params['u']);

      if (newUnit === null) {
        return null;
      } else {
        return this.bs.getUnit(this.tss.sessionToken, newUnit.name)
          .switchMap((udata: GetXmlResponseData) => {
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

                // resources ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                const resourcesElement = resourcesElements[0];
                const rList = resourcesElement.getElementsByTagName('Resource');
                for (let i = 0; i < rList.length; i++) {
                  const myResource = new ResourceData(rList[i].textContent, rList[i].getAttribute('name'));
                  myResource.type = rList[i].getAttribute('type');
                  newUnit.resources.push(myResource);

                  // prepare promise for each resource loading
                  if (myResource.type === 'itemplayer_html') {
                    ResourceFetchPromises.push(new Promise((resolve, reject) => {
                      this.bs.getUnitResourceTxt(this.tss.sessionToken, myResource.name).subscribe(
                        (fileAsTxt: string) => {
                          myResource.dataString = fileAsTxt;
                          resolve(myResource.dataString.length);
                        }
                      );
                    }));
                  } else {
                    ResourceFetchPromises.push(new Promise((resolve, reject) => {
                      this.bs.getUnitResource64(this.tss.sessionToken, myResource.name).subscribe(
                        (fileAsBase64: string) => {
                          myResource.dataString = fileAsBase64;
                          resolve(myResource.dataString.length);
                        }
                      );
                    }));
                  }
                }

                // run all promises (i. e. resource loading requests)
                return Promise.all(ResourceFetchPromises)
                  .then(promisesReturnValues => {
                    console.log(newUnit);
                    return newUnit;
                  });
              } else {
                return Observable.of(newUnit);
              }
          } else {
            return Observable.of(null);
          }
        });
      }
    }
}


export const routingProviders = [UnitActivateGuard, UnitDeactivateGuard, UnitResolver];
