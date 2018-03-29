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
  private scripts: string[];
  private resources: ResourceData[];
  private restorePoint: string;
  private dataForItemplayer: string;


  // : : : : : : : : : : : :
  constructor(xUnit, gss: GlobalStoreService, bs: BackendService) {
    const xUnitElement = <HTMLElement>xUnit;
    this._name = xUnitElement.getAttribute('name');
    this._title = xUnitElement.getAttribute('title');

    this.scripts = [];
    this.resources = [];
    this.restorePoint = '';
    this.dataForItemplayer = '';

    this.gss = gss;
    this.bs = bs;

    this.scripts.push('hupf(){let jaja="doof"; let soso="schick"; alert(soso+jaja);}');
    this.scripts.push('schnupf(){let jaja="keine Ahnung"; let soso="392881998344"; alert(soso+jaja);}');
}

  // : : : : : : : : : : : :
  load() {
    this.bs.getUnit(this.gss.sessionToken, this._name).subscribe(
      (udata: GetXmlResponseData) => {
        this.restorePoint = udata.status;

        const oParser = new DOMParser();
        const oDOM = oParser.parseFromString(udata.xml, 'text/xml');
        if (oDOM.documentElement.nodeName === 'Unit') {
          // ________________________
          const dataElements = oDOM.documentElement.getElementsByTagName('Data');
          if (dataElements.length > 0) {
            const dataElement = dataElements[0];
            this.dataForItemplayer = dataElement.textContent;
          }

          // ________________________
          const resourcesElements = oDOM.documentElement.getElementsByTagName('Resources');
          if (resourcesElements.length > 0) {
            const resourcesElement = resourcesElements[0];
            const rList = resourcesElement.getElementsByTagName('Resource');
            for (let i = 0; i < rList.length; i++) {
              const myResource = new ResourceData(rList[i].textContent, rList[i].getAttribute('alias'));
              myResource.type = rList[i].getAttribute('type');
              this.resources[myResource.alias] = myResource;
              console.log(myResource);
            }
          }
        }
      }, (errormsg: string) => {
        console.log('error: ' + errormsg);
      }
    );
  }

  // : : : : : : : : : : : :
  getIFrameDocument() {
    let docString = '<html><head>';
    /* for (let i = 0; i < this.scripts.length; i++) {
      docString = docString + '<script>' + this.scripts[i] + '</script>';
    } */
    docString = docString + '</head><body><p>jüsäfö</p></body></html>';

    return docString;

    // const oParser = new DOMParser();

    // return oParser.parseFromString(docString, 'text/xml');
  }
}

