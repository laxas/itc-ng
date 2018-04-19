import { Subscriber } from 'rxjs/Subscriber';
import { BackendService, GetXmlResponseData } from './../backend.service';
import { TestdataService, UnitDef, ResourceData } from './../testdata.service';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Location } from '@angular/common';

@Component({
  templateUrl: './unithost.component.html',
  styleUrls: ['./unithost.component.css']
})

export class UnithostComponent implements OnInit, OnDestroy {
  private message = '';

  // public showIframe = false;
  private iFrameHostElement: HTMLElement;
  private iFrameItemplayer: HTMLIFrameElement;
  private routingSubscription: Subscription;

  constructor(
    private tss: TestdataService,
    private bs: BackendService,
    private location: Location,
    private route: ActivatedRoute
  ) {
    this.tss.statusmessage$.subscribe(s => {
      this.message = s;
    });
  }

  ngOnInit() {
    this.iFrameHostElement = <HTMLElement>document.querySelector('#iFrameHost');

    this.iFrameItemplayer = null;

    this.routingSubscription = this.route.params.subscribe(
      params => {
        // VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
        while (this.iFrameHostElement.hasChildNodes()) {
          this.iFrameHostElement.removeChild(this.iFrameHostElement.lastChild);
        }
        const newUnit: UnitDef = this.route.snapshot.data['unit'];

        if ((newUnit === null) || (newUnit === undefined)) {
          const messageElement = <HTMLElement>document.createElement('p');
          messageElement.setAttribute('class', 'unitMessage');
          messageElement.innerHTML = this.tss.statusmessage$.getValue();
          this.iFrameHostElement.appendChild(messageElement);

          this.tss.updatePageTitle('Problem?');
          this.tss.updateUnitId(-1);
        } else {
          this.tss.updatePageTitle(newUnit.title);
          this.tss.updateUnitId(newUnit.sequenceId);

          this.iFrameItemplayer = <HTMLIFrameElement>document.createElement('iframe');
          this.iFrameItemplayer.setAttribute('srcdoc', newUnit.getItemplayerHtml());
          this.iFrameItemplayer.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin');
          this.iFrameItemplayer.setAttribute('class', 'unitHost');
          this.iFrameItemplayer.setAttribute('height', String(this.iFrameHostElement.clientHeight));

          this.iFrameItemplayer.onload = () => {
            const crtUnit = this.route.snapshot.data['unit'];
            if ((crtUnit !== null) && (this.iFrameItemplayer !== null)) {
            this.iFrameItemplayer.contentWindow.postMessage({
              messageType: 'ItemPlayerCommand',
              commandName: 'initialize',
              commandParameters: {
                  itemSpecification: crtUnit.dataForItemplayer,
                  itemResources: {
                      m005: ''
                  },
                  restorePoint: crtUnit.restorePoint
                }
            }, '*');
          }};

          this.iFrameHostElement.appendChild(this.iFrameItemplayer);
        }
      });
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  ngOnDestroy() {
    this.routingSubscription.unsubscribe();
  }
}
