import { BackendService, GetXmlResponseData } from './backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TestdataService, UnitDef, ResourceData } from './testdata.service';

@Component({
  templateUrl: './test-controller.component.html',
  styleUrls: ['./test-controller.component.css']
})
export class TestControllerComponent implements OnInit {
  private dataLoading: boolean;

  constructor(
    private tss: TestdataService,
    private router: Router,
    private route: ActivatedRoute,
    private bs: BackendService
  ) {
    this.dataLoading = false;
  }

  ngOnInit() {
    this.tss.currentUnitChanged.subscribe((newUnit: UnitDef) => {
      if (newUnit == null) {
        this.router.navigate(['p']);
      } else {
        this.tss.updatePageTitle(newUnit.name);
        this.tss.isProblem = false;

        this.bs.getUnit(this.tss.sessionToken, newUnit.name).subscribe(
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
                Promise.all(ResourceFetchPromises)
                  .then(promisesReturnValues => {
                    this.router.navigate(['u', newUnit.sequenceId], { relativeTo: this.route });
                  });

                } else {
                  this.router.navigate(['u', newUnit.sequenceId], { relativeTo: this.route });
              }
            }
          }
        );
      }
    });

    // ################################################
    // triggers currentUnitChanged so new Unithost will be loaded
    this.tss.loadBookletDefinition();
  }

}
