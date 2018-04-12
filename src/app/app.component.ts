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
  public navPrevEnabled = true;
  public navNextEnabled = true;
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
    merge(
      this.gss.pageTitle$,
      this.tss.pageTitle$,
      this.ass.pageTitle$).subscribe(t => {
        this.title = t;
      });

    this.tss.navNextEnabled$.subscribe(e => {
      this.navNextEnabled = e;
    });
    this.tss.navPrevEnabled$.subscribe(e => {
      this.navPrevEnabled = e;
    });
    this.ass.isAdmin$.subscribe(i => {
      this.isAdmin = i;
    });

    this.tss.sessionStatusChanged.subscribe(newWS => {
      this.isSession = this.tss.isSession;
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
        status: this.isAdmin ? ('angemeldet als ' + this.ass.loginName$.getValue()) : 'nicht angemeldet',
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

  navPrev() {
    this.tss.gotoPrevUnit();
  }

  navNext() {
    this.tss.gotoNextUnit();
  }
}
