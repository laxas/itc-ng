import { BackendService, GetXmlResponseData } from './../backend.service';
import { TestdataService, UnitDef, ResourceData } from './../testdata.service';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  templateUrl: './unithost.component.html',
  styleUrls: ['./unithost.component.css']
})

export class UnithostComponent implements OnInit, OnDestroy {
  private myMessage = '';
  public dataLoading = false;
  public showIframe = false;
  private iFrameHostElement: HTMLElement;
  private iFrameItemplayer: HTMLIFrameElement;
  private routingSubscription: Subscription;

  constructor(
    private tss: TestdataService,
    private bs: BackendService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.iFrameHostElement = <HTMLElement>document.querySelector('#iFrameHost');
    this.iFrameItemplayer = null;

    this.routingSubscription = this.route.params.subscribe(
      params => {
        // VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
        console.log('entering unithost.component with parameter >' + params['u'] + '<');

        const myUnit = this.tss.currentUnit;
        if (myUnit !== null) {
          console.log(myUnit);
          this.iFrameItemplayer = <HTMLIFrameElement>document.createElement('iframe');
          this.iFrameItemplayer.setAttribute('srcdoc', myUnit.getItemplayerHtml());
          this.iFrameItemplayer.setAttribute('sandbox', 'allow-forms allow-scripts');
          this.iFrameItemplayer.setAttribute('class', 'unitHost');
          this.iFrameItemplayer.setAttribute('height', String(this.iFrameHostElement.clientHeight));

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
    );
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  ngOnDestroy() {
    this.routingSubscription.unsubscribe();
  }
}
