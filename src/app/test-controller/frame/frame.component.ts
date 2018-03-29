import { BackendService, GetXmlResponseData } from './../backend.service';
import { TestdataService } from './../testdata.service';
import { UnitData } from './../unitdata';
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

  constructor(
    private gss: GlobalStoreService,
    private tss: TestdataService,
    private bs: BackendService
  ) {
    this.itemPlaygroundDoc = '<!DOCTYPE html><html><head><script>function tututu(){let z="e";document.querySelector("h1").innerHTML = "sososo";}</script></head><body><h1>so fein schü</h1></body></html>';
  }

  ngOnInit() {
    this.myMessage = 'Bitte warten';
    // this.dataLoading = true;
    this.tss.currentUnitChanged.subscribe((newUnit: UnitData) => {
      this.myMessage = newUnit.title;
      // this.itemPlaygroundDoc = newUnit.getIFrameDocument();
      // newUnit.loadResources();
      // this.dataLoading = false;
    });
    this.tss.loadBookletDefinition();
  }

  public so() {
    const ifrm = document.createElement('iframe');
    ifrm.setAttribute('srcdoc', this.itemPlaygroundDoc);
    ifrm.setAttribute('frameborder', '0');

    document.querySelector('#iFrameHost').appendChild(ifrm);


    // const myTemplate = document.querySelector('#iFrameTemplate').content;
    // const iFrameElement = document.importNode(myTemplate, true);
    // document.querySelector('#iFrameHost').appendChild(iFrameElement);
  }

  public aler(msg) {
    // document.querySelector('iframe').contentDocument.querySelector('h1').innerHTML = msg;
  }
}
