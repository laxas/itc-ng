import { BackendService, GetXmlResponseData } from './../backend.service';
import { TestdataService, UnitDef, ResourceData } from './../testdata.service';
import { Component, OnInit } from '@angular/core';
import { GlobalStoreService } from './../../shared/global-store.service';


@Component({
  templateUrl: './unithost.component.html',
  styleUrls: ['./unithost.component.css']
})
export class UnithostComponent implements OnInit {
  private myMessage = '';
  public dataLoading = false;
  public showIframe = false;
  private iFrameHostElement: HTMLElement;
  private iFrameItemplayer: HTMLIFrameElement;

  constructor(
    private gss: GlobalStoreService,
    private tss: TestdataService,
    private bs: BackendService
  ) { }

  ngOnInit() {
    this.myMessage = 'Bitte warten';
    this.iFrameHostElement = <HTMLElement>document.querySelector('#iFrameHost');
    this.iFrameItemplayer = null;

    window.addEventListener('message', function(event) {
      console.log(event);
    }, false);

    // this.dataLoading = true;
    // set listener to currentUnitChanged-event
    // this will load resources of the new unit and re-init itemplayer
    // ================================================================================
    // ================================================================================
    this.tss.currentUnitChanged.subscribe((newUnit: UnitDef) => {
      this.gss.title = newUnit.name;
      this.myMessage = '';

      // cleanup old Itemplayer
      while (this.iFrameHostElement.hasChildNodes()) {
        const iFrameElement = <HTMLIFrameElement>this.iFrameHostElement.lastChild;
        // iFrameElement.contentDocument.disposeItemplayer('yoyoy');
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
                const myResource = new ResourceData(rList[i].textContent, rList[i].getAttribute('name'));
                myResource.type = rList[i].getAttribute('type');
                newUnit.resources.push(myResource);

                // add promise to load all resources at the end
                if (myResource.type === 'itemplayer_html') {
                  ResourceFetchPromises.push(new Promise((resolve, reject) => {
                    this.bs.getUnitResourceTxt(this.gss.sessionToken, myResource.name).subscribe(
                      (fileAsTxt: string) => {
                        myResource.dataString = fileAsTxt;
                        resolve(myResource.dataString.length);
                      }
                    );
                  }));
                } else {
                  ResourceFetchPromises.push(new Promise((resolve, reject) => {
                    this.bs.getUnitResource64(this.gss.sessionToken, myResource.name).subscribe(
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
                  this.setupNewIFrame();
                });

              } else {
              this.setupNewIFrame();
            }
          }
        }
      );
    });
    // ================================================================================
    // ================================================================================

    // loads booklet and defines first unit
    this.tss.loadBookletDefinition();
  }


  // VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
  setupNewIFrame() {
    const myUnit = this.tss.currentUnit;
    if (myUnit !== null) {
      console.log(myUnit);
      this.iFrameItemplayer = <HTMLIFrameElement>document.createElement('iframe');
      this.iFrameItemplayer.setAttribute('srcdoc', myUnit.getItemplayerHtml());
      // this.iFrameItemplayer.setAttribute('sandbox', 'allow-forms allow-scripts');
      this.iFrameItemplayer.setAttribute('class', 'unitHost');
      // this.iFrameItemplayer.setAttribute('scrolling', 'no');
      this.iFrameItemplayer.onload = () => {
        this.iFrameItemplayer.contentWindow.postMessage({
          messageType: 'ItemPlayerCommand',
          commandName: 'initialize',
          commandParameters: {
              itemSpecification: this.tss.currentUnit.dataForItemplayer,
              itemResources: {
                  m005: ''
              },
              restorePoint: this.tss.currentUnit.restorePoint
              }

/*          messageType: 'initItemplayer',
          data: {
            itemspec:
            restorePoint:
          }*/



        }, '*');
      };

      this.iFrameHostElement.appendChild(this.iFrameItemplayer);
    }
  }

  soso() {
    console.log('enter soso()');
    this.iFrameItemplayer.contentWindow.postMessage('jajaja', '*');
  }
}
