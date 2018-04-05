import { IqbCommonModule, ConfirmDialogComponent, ConfirmDialogData } from './../iqb-common';
import { Injectable, Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { BackendService, LoginStatusResponseData, WorkspaceData } from './backend/backend.service';
import { FormGroup } from '@angular/forms';

@Injectable()
export class StatusService {
  @Output() loginStatusChanged: EventEmitter<any> = new EventEmitter();
  @Output() workspaceChanged: EventEmitter<any> = new EventEmitter();
  @Output() communicationProblemChanged: EventEmitter<any> = new EventEmitter();

  private _title = 'Admin-Bereich';
  private _adminToken = '';
  private _myWorkspaces: WorkspaceData[];
  private _myWorkspaceId = 0;
  private _myWorkspaceName = '';
  private _myLoginName = ''; // dient als Indikator für Login-Status
  private lastloginname: string;
  private _communicationProblemMessage = '';
  private _isCommunicationProblem = false;


  constructor (
    public loginDialog: MatDialog,
    public confirmDialog: MatDialog,
    private bs: BackendService,
    private router: Router
  ) {
    this._myWorkspaces = [];
    this.lastloginname = '';
  }


  // title __________________________________________________
  get title(): string {
    return this._title;
  }

  // Token
  set adminToken(newToken: string) {
    if (newToken !== this._adminToken) {
      this._adminToken = newToken;
      localStorage.setItem('at', newToken);
    }
  }
  get adminToken(): string {
    if (this._adminToken.length === 0) {
      this._adminToken = localStorage.getItem('at');
    }
    return this._adminToken;
  }


  // Login/Workspace __________________________________
  get myLoginName(): string {
    return this._myLoginName;
  }


  public isLoggedIn(): boolean {
    return this._adminToken.length > 0;
  }

  set myLoginName(loginname: string) {
    if (loginname !== this._myLoginName) {
      this._myLoginName = loginname;
      this.loginStatusChanged.emit(this.isLoggedIn());
    }
  }

  get myWorkspaceName(): string {
    return this._myWorkspaceName;
  }
  // set myWorkspaceName(workspace: string) NO -> set by myWorkspaceId

  get myWorkspaceId(): number {
    return this._myWorkspaceId;
  }
  set myWorkspaceId(workspace: number) {
    if (workspace !== this._myWorkspaceId) {
      this._myWorkspaceId = workspace;
      if (workspace === 0) {
        this._myWorkspaceName = '';
      } else {
        for (const ws in this._myWorkspaces) {
          if (ws['id'] === workspace) {
            this._myWorkspaceName = ws['name'];
            break;
          }
        }
      }
    }
    this.workspaceChanged.emit(workspace);
  }

  get myWorkspaces():  WorkspaceData[] {
    return this._myWorkspaces;
  }
  set myWorkspaces(newWSList: WorkspaceData[]) {
    this._myWorkspaces = newWSList;
    let newWsId = 0;
    if (this._myWorkspaces.length > 0) {
      newWsId = this._myWorkspaces[0]['id'];
      for (const ws in this._myWorkspaces) {
        if (ws['id'] === this._myWorkspaceId) {
          newWsId = ws['id'];
          break;
        }
      }
      this.myWorkspaceId = newWsId;
    } else {
      this.myWorkspaceId = 0;
    }
  }

  // CommProblem?          __________________________________
  get isCommunicationProblem(): boolean {
    return this._isCommunicationProblem;
  }
  get communicationProblemMessage(): string {
    return this._communicationProblemMessage;
  }
  set communicationProblemMessage(newMessage: string) {
    this._communicationProblemMessage = newMessage;
    this._isCommunicationProblem = newMessage.length > 0;
    this.communicationProblemChanged.emit(this._isCommunicationProblem);
  }

  // *******************************************************************************************************
  login() {
    const dialogRef = this.loginDialog.open(LoginDialogComponent, {
      width: '600px',
      data: {
        lastloginname: this.lastloginname
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'undefined') {
        console.log('undefined');
      } else {
        if (result === false) {
          console.log('falssse');
        } else {
          this.bs.login((<FormGroup>result).get('name').value, (<FormGroup>result).get('pw').value).subscribe(
            loginresponse => {
              this.adminToken =  loginresponse.admintoken;
              this.myLoginName = loginresponse.name;
              this.lastloginname = loginresponse.name;
              this.myWorkspaces = loginresponse.workspaces;
              this.communicationProblemMessage = '';
              this.router.navigateByUrl('/admin');
            }, (errormsg: string) => {
              this.communicationProblemMessage = errormsg;
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
      if (result === true) {
        this.bs.logout(this._adminToken).subscribe(
          logoutresponse => {
            this.myLoginName = '';
            this.myWorkspaces = [];
            this.adminToken = '';
            this.communicationProblemMessage = '';
            this.router.navigateByUrl('/');
          }, (errormsg: string) => {
            this.communicationProblemMessage = errormsg;
          }
        );
      }
    });
  }

  // *******************************************************************************************************
  loadStatus() {
    this.bs.getStatus(this.adminToken).subscribe(
      (rData: LoginStatusResponseData) => {
        this.myWorkspaces = rData.workspaces;
        this.myLoginName = rData.name;
        this.communicationProblemMessage = '';
      }, (errormsg: string) => {
        this.communicationProblemMessage = errormsg;
    });
  }
}
