import { LoginStatusResponseData } from './admin/backend/backend.service';
import { StatusService } from './admin';
import { IqbCommonModule, ConfirmDialogComponent, ConfirmDialogData } from './iqb-common';
import { BackendService } from './shared/backend.service';
import { Router } from '@angular/router';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import { GlobalStoreService } from './shared/global-store.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {
  public title: string;
  public navPrevDisabled: boolean;
  public navNextDisabled: boolean;
  public isAdmin: boolean;
  public isSession: boolean;

  constructor (
    private gss: GlobalStoreService,
    private ass: StatusService,
    private router: Router,
    private bs: BackendService,
    public aboutDialog: MatDialog) {  }

  ngOnInit() {
    this.title = this.gss.title;
    this.navNextDisabled = !this.gss.navNextEnabled;
    this.navPrevDisabled = !this.gss.navPrevEnabled;
    this.isAdmin = this.ass.isLoggedIn();
    this.isSession = this.gss.isSession();

    this.gss.titleChanged.subscribe((newtitle: string) => {
      this.title = newtitle;
    });
    this.gss.navNextEnabledChanged.subscribe((isEnabled: boolean) => {
      this.navNextDisabled = !isEnabled;
    });
    this.gss.navPrevEnabledChanged.subscribe((isEnabled: boolean) => {
      this.navPrevDisabled = !isEnabled;
    });
    this.ass.loginStatusChanged.subscribe((newloginstatus: boolean) => {
      this.isAdmin = newloginstatus;
    });
    this.gss.sessionStatusChanged.subscribe(newWS => {
      this.isSession = this.gss.isSession();
    });
  }

  // *******************************************************************************************************
  showAboutDialog() {
    const dialogRef = this.aboutDialog.open(AboutDialogComponent, {
      width: '500px',
      data: {
        status: this.isAdmin ? ('angemeldet als ' + this.ass.myLoginName) : 'nicht angemeldet',
        workspace: this.isAdmin ? this.ass.myWorkspaceName : '-'
      }
    });
  }

  // *******************************************************************************************************
  login() {
    this.ass.login();
  }

  // *******************************************************************************************************
  logout() {
    this.ass.logout();
  }
}
