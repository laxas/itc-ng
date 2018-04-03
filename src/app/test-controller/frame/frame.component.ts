import { BackendService, GetXmlResponseData } from './../backend.service';
import { TestdataService, UnitDef, ResourceData } from './../testdata.service';
import { Component, OnInit } from '@angular/core';
import { GlobalStoreService } from './../../shared/global-store.service';


@Component({
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css']
})
export class FrameComponent implements OnInit {
  private myMessage = '';
  public dataLoading = false;
  public itemPlaygroundDoc = null;
  public showIframe = false;
  private iFrameHostElement: HTMLElement;

  constructor(
    private gss: GlobalStoreService,
    private tss: TestdataService,
    private bs: BackendService
  ) {
    this.itemPlaygroundDoc = '<!DOCTYPE html><html><head><script>function tututu()';
    this.itemPlaygroundDoc = this.itemPlaygroundDoc + '{let z="e";document.querySelector("h1").innerHTML = "sososo";}</script></head>';
    this.itemPlaygroundDoc = this.itemPlaygroundDoc + '<body><h1>so fein schü</h1></body></html>';
  }

  ngOnInit() {
    this.myMessage = 'Bitte warten';
    this.iFrameHostElement = document.querySelector('#iFrameHost');

    // this.dataLoading = true;
    this.tss.currentUnitChanged.subscribe((newUnit: UnitDef) => {
      this.gss.title = newUnit.name;
      this.myMessage = '';

      // cleanup old Itemplayer
      while (this.iFrameHostElement.hasChildNodes()) {
        const iFrameElement = <HTMLIFrameElement>this.iFrameHostElement.lastChild;
        // iFrameElement.contentDocument.disposeItemplayer();
        this.iFrameHostElement.removeChild(iFrameElement);
      }

      this.bs.getUnit(this.gss.sessionToken, newUnit.name).subscribe(
        (udata: GetXmlResponseData) => {
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
                const myResource = new ResourceData(rList[i].textContent, rList[i].getAttribute('alias'));
                myResource.type = rList[i].getAttribute('type');
                newUnit.resources[myResource.alias] = myResource;

                // add promise to load all resources at the end
                ResourceFetchPromises.push(new Promise((resolve, reject) => {
                  this.bs.getUnitResource(this.gss.sessionToken, myResource.name).subscribe(
                    (fileAsBase64: string) => {
                      myResource.dataString = fileAsBase64;
                      resolve(myResource.dataString.length);
                    }
                  );
                }));
              }
              Promise.all(ResourceFetchPromises)
                .then(promisesReturnValues => {
                  this.setupNewIFrame();
                });

              } else {
              this.setupNewIFrame();
            }
          }
        }
      );
    });

    // loads booklet and defines first unit
    this.tss.loadBookletDefinition();
  }

  setupNewIFrame() {
    const ifrm = document.createElement('iframe');
    ifrm.setAttribute('srcdoc', this.itemPlaygroundDoc);
    ifrm.setAttribute('frameborder', '0');

    this.iFrameHostElement.appendChild(ifrm);
    // ifrm.contentDocument.init();
  }
}
