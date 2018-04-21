import { merge } from 'rxjs/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscriber } from 'rxjs/Subscriber';
import { Subscription } from 'rxjs/Subscription';

import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { switchMap } from 'rxjs/operators/switchMap';
import { TestdataService } from './test-controller';
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
  public title = '';
  public navPrevEnabled = false;
  public navNextEnabled = false;
  public isAdmin = false;
  public isSession = false;

  constructor (
    private gss: GlobalStoreService,
    private ass: StatusService,
    private tss: TestdataService,
    private router: Router,
    private bs: BackendService,
    public aboutDialog: MatDialog) {  }

  ngOnInit() {
    this.tss.isSession$.subscribe(is => this.isSession = is);
    this.tss.navNextEnabled$.subscribe(is => this.navNextEnabled = is);
    this.tss.navPrevEnabled$.subscribe(is => this.navPrevEnabled = is);
    this.ass.isAdmin$.subscribe(is => this.isAdmin = is);

    merge(
      this.gss.pageTitle$,
      this.tss.pageTitle$,
      this.ass.pageTitle$).subscribe(t => {
        this.title = t;
      });

    window.addEventListener('message', (event) => {
      this.tss.processMessagePost(event);
    }, false);
  }

  // *******************************************************************************************************
  showAboutDialog() {
    const dialogRef = this.aboutDialog.open(AboutDialogComponent, {
      width: '500px',
      data: {
        status: this.ass.isAdmin$.getValue() ? ('angemeldet als ' + this.ass.loginName$.getValue()) : 'nicht angemeldet',
        workspace: this.ass.isAdmin$.getValue() ? this.ass.myWorkspaceName : '-'
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

  navPrev() {
    this.tss.gotoPrevUnit();
  }

  navNext() {
    this.tss.gotoNextUnit();
  }
}
