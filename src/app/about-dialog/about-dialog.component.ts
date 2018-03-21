import { GlobalStoreService } from './../shared/global-store.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'tc-about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.css']
})
export class AboutDialogComponent implements OnInit {
  public appName: String;
  public appPublisher: String;
  public appVersion: String;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private gss: GlobalStoreService) { }

  ngOnInit() {
    this.appName = this.gss.appName;
    this.appVersion = this.gss.appVersion;
    this.appPublisher = this.gss.appPublisher;
  }

}
