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

  constructor(
    private gss: GlobalStoreService,
    private tss: TestdataService,
    private bs: BackendService
  ) { }

  ngOnInit() {
    this.myMessage = 'Bitte warten';
    this.dataLoading = true;
    this.tss.currentUnitChanged.subscribe((newUnit: UnitData) => {
      this.myMessage = newUnit.title;
      newUnit.loadResources();
      this.dataLoading = false;
    });
    this.tss.loadBookletDefinition();
  }

}
