import { GlobalStoreService } from './../shared/global-store.service';
import { BackendService, GetXmlResponseData } from './backend.service';


/*
  this.bs.getUnit(this.gss.sessionToken, this._currentUnit.name).subscribe(
    (bdata: GetXmlResponseData) => {
      this.currentUnitChanged.emit(this._currentUnit);
    }, (errormsg: string) => {
      this._currentUnit = null;
      this._errorMessage = errormsg;
      this.currentUnitChanged.emit(this._currentUnit);
    }
  );

} */

// .....................................................................
export class UnitData {
  private _title: string;
  get title(): string {
    return this._title;
  }
  private _name: string;
  get name(): string {
    return this._name;
  }
  private _isNaviPoint: boolean;
  private _order: number;
  private bs: BackendService;
  private gss: GlobalStoreService;


  // : : : : : : : : : : : :
  constructor(xUnit, gss: GlobalStoreService, bs: BackendService) {
    const xUnitElement = <HTMLElement>xUnit;
    this._name = xUnitElement.getAttribute('name');
    this._title = xUnitElement.getAttribute('title');

    this.gss = gss;
    this.bs = bs;
  }

  // : : : : : : : : : : : :
  loadResources() {
    this.bs.getUnit(this.gss.sessionToken, this._name).subscribe(
      (udata: GetXmlResponseData) => {
        console.log(udata);
      }, (errormsg: string) => {
        console.log('error: ' + errormsg);
      }
    );
  }
}
