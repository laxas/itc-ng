import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IqbCommonModule, ConfirmDialogComponent, ConfirmDialogData } from './../iqb-common';
import { Injectable, Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { BackendService, LoginStatusResponseData, WorkspaceData, ServerError } from './backend/backend.service';
import { FormGroup } from '@angular/forms';

@Injectable()
export class StatusService {
  public pageTitle$ = new BehaviorSubject('Teststart');
  public isAdmin$ = new BehaviorSubject<boolean>(false);
  public loginName$ = new BehaviorSubject<string>('');
  public workspaceId$ = new BehaviorSubject<number>(-1);
  public workspaceList$ = new BehaviorSubject<WorkspaceData[]>([]);
  public notLoggedInMessage$ = new BehaviorSubject<string>('');
  public adminToken$ = new BehaviorSubject<string>('');


  get myWorkspaceName(): string {
    const wsId = this.workspaceId$.getValue();
    const workspaceList = this.workspaceList$.getValue();
    if (workspaceList.length > 0) {
      for (let i = 0; i < workspaceList.length; i++) {
        if (workspaceList[i]['id'] === wsId) {
          return workspaceList[i]['name'];
        }
      }
    }
    return '';
  }

  // .................................................................................
  private _lastloginname = '';

  // ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
  constructor (
    public loginDialog: MatDialog,
    public confirmDialog: MatDialog,
    private bs: BackendService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    let myToken = localStorage.getItem('at');
    if ((myToken === null) || (myToken === undefined)) {
      myToken = '';
    } else {
      this.bs.getStatus(myToken).subscribe(
        (admindata: LoginStatusResponseData) => {
          this.updateAdminStatus(admindata.admintoken, admindata.name, admindata.workspaces, '');
        }, (err: ServerError) => {
          this.updateAdminStatus('', '', [], err.label);
      });
    }

    const wsId = localStorage.getItem('ws');
    if (wsId !== null) {
      this.workspaceId$.next(+wsId);
    }

  }


  // *******************************************************************************************************
  login() {
    const dialogRef = this.loginDialog.open(LoginDialogComponent, {
      width: '600px',
      data: {
        lastloginname: this._lastloginname
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.bs.login((<FormGroup>result).get('name').value, (<FormGroup>result).get('pw').value).subscribe(
            (admindata: LoginStatusResponseData) => {
              this.updateAdminStatus(admindata.admintoken, admindata.name, admindata.workspaces, '');
              this.route.url.map(segments => segments.join('')).subscribe(u => {
                if (u.indexOf('/admin') < 0) {
                  this.router.navigateByUrl('/admin');
                }
              });
            }, (err: ServerError) => {
              this.updateAdminStatus('', '', [], err.label);
            }
          );
        }
      }
    });
  }

  // *******************************************************************************************************
  logout() {
    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      height: '300px',
      data:  <ConfirmDialogData>{
        title: 'Abmelden',
        content: 'Möchten Sie sich abmelden?',
        confirmbuttonlabel: 'Abmelden'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.bs.logout(this.adminToken$.getValue()).subscribe(
          logoutresponse => {
            this.updateAdminStatus('', '', [], '');
            this.route.url.map(segments => segments.join('')).subscribe(u => {
              if (u.indexOf('/admin') >= 0) {
                this.router.navigateByUrl('/');
              }
            });
          }, (err: ServerError) => {
            this.updateAdminStatus('', '', [], err.label);
          }
        );
      }
    });
  }

  // *******************************************************************************************************
  updatePageTitle(newTitle: string) {
    this.pageTitle$.next(newTitle);
  }
  updateWorkspaceId(newId: number) {
    this.workspaceId$.next(newId);
    localStorage.setItem('ws', String(newId));
  }
  updateAdminStatus(token: string, name: string, workspaces: WorkspaceData[], message: string) {
    if ((token === null) || (token.length === 0)) {
      this.isAdmin$.next(false);
      localStorage.removeItem('at');
      this.adminToken$.next('');
      this.workspaceId$.next(-1);
      this.workspaceList$.next([]);
      this.loginName$.next('');
      this.notLoggedInMessage$.next(message);
    } else {
      this.isAdmin$.next(true);
      localStorage.setItem('at', token);
      this.adminToken$.next(token);
      this.workspaceList$.next(workspaces);
      this.loginName$.next(name);
      this.notLoggedInMessage$.next('');

      // set valid workspace-id
      const wsId = this.workspaceId$.getValue();
      if (workspaces.length > 0) {
        let newWsId = workspaces[0]['id'];
        for (let i = 0; i < workspaces.length; i++) {
          if (workspaces[i]['id'] === wsId) {
            newWsId = wsId;
            break;
          }
        }
        this.updateWorkspaceId(newWsId);
      } else {
        this.updateWorkspaceId(-1);
      }
    }
  }
}

