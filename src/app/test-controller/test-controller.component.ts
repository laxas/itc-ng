import { BackendService, GetXmlResponseData, ServerError } from './backend.service';
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
    this.tss.currentUnit$.subscribe(myUnit => {
      if (myUnit !== null) {
        this.router.navigateByUrl('/t/u/' + myUnit.sequenceId);
      }
    });

    this.tss.isSession$.subscribe(isSession => {
      if (isSession) {
        this.bs.getStatus(this.tss.sessionToken).subscribe(
            (bdata: GetXmlResponseData) => {
              let myBookletName = '';

              // Create Unit-List
              const myUnits: UnitDef[] = [];
              const oParser = new DOMParser();
              const oDOM = oParser.parseFromString(bdata.xml, 'text/xml');
              if (oDOM.documentElement.nodeName === 'Booklet') {
                // ________________________
                const metadataElements = oDOM.documentElement.getElementsByTagName('Metadata');
                if (metadataElements.length > 0) {
                  const metadataElement = metadataElements[0];
                  const NameElement = metadataElement.getElementsByTagName('Name')[0];
                  myBookletName = NameElement.textContent;
                }

                // ________________________
                const unitsElements = oDOM.documentElement.getElementsByTagName('Units');
                if (unitsElements.length > 0) {
                  const unitsElement = unitsElements[0];
                  const unitList = unitsElement.getElementsByTagName('Unit');
                  for (let i = 0; i < unitList.length; i++) {
                    myUnits[i] = new UnitDef(unitList[i].getAttribute('name'), unitList[i].getAttribute('title'));
                    myUnits[i].sequenceId = i;
                  }
                }
              }
              this.tss.updateBookletData(myBookletName, myUnits, 'Bitte warten');
            }, (err: ServerError) => {
              this.tss.updateBookletData('?', [], err.label);
            }
        );
      }
    });
  }
}
