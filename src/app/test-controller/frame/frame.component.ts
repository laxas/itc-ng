import { Component, OnInit } from '@angular/core';
import { GlobalStoreService } from './../../shared/global-store.service';

@Component({
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css']
})
export class FrameComponent implements OnInit {
  private myMessage = '';

  constructor(
    private gss: GlobalStoreService,
  ) { }

  ngOnInit() {
    this.myMessage = 'jojojo: ' + this.gss.sessionToken;
  }

}
