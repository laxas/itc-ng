import { switchMap, map } from 'rxjs/operators';
import { ResourceData } from './../testdata.service';
import { GetXmlResponseData, BackendService, ServerError } from './../backend.service';
import { UnithostComponent } from './unithost.component';
import { Injectable, Component } from '@angular/core';
import { CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/Observable/of';

// import 'rxjs/add/Observable/map';
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
      if (this.tss.isSession$.getValue() === true) {
        return this.tss.getUnitAt(next.params['u'])
          .switchMap((newUnit: UnitDef) => {
          return this.tss.fetchUnitData(newUnit);
        });
      } else {
        return null;
      }
    }
}


export const routingProviders = [UnitActivateGuard, UnitDeactivateGuard, UnitResolver];
