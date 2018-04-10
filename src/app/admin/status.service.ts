import { IqbCommonModule, ConfirmDialogComponent, ConfirmDialogData } from './../iqb-common';
import { Injectable, Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { BackendService, LoginStatusResponseData, WorkspaceData, ServerError } from './backend/backend.service';
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
    this._myWorkspaceId = 0;
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
      this.loginStatusChanged.emit(this.isLoggedIn());
    }
  }
  get adminToken(): string {
    if (this._adminToken.length === 0) {
      this._adminToken = localStorage.getItem('at');
      if (this._adminToken === null) {
        this._adminToken = '';
      }
    }
    return this._adminToken;
  }


  // Login/Workspace __________________________________
  get myLoginName(): string {
    return this._myLoginName;
  }


  public isLoggedIn(): boolean {
    return this.adminToken.length > 0;
  }

  set myLoginName(loginname: string) {
    if (loginname !== this._myLoginName) {
      this._myLoginName = loginname;
    }
  }

  get myWorkspaceName(): string {
    return this._myWorkspaceName;
  }
  // set myWorkspaceName(workspace: string) NO -> set by myWorkspaceId

  get myWorkspaceId(): number {
    if (this._myWorkspaceId === 0) {
      const wsIdStr = localStorage.getItem('ws');
      if (wsIdStr !== null) {
        if (wsIdStr.length > 0) {
          this._myWorkspaceId = +wsIdStr;
        }
      }
    }
    return this._myWorkspaceId;
  }
  set myWorkspaceId(workspace: number) {
    if (workspace !== this._myWorkspaceId) {
      this._myWorkspaceId = workspace;
      localStorage.setItem('ws', String(workspace));
      if (workspace === 0) {
        this._myWorkspaceName = '';
      } else {
        for (let i = 0; i < this._myWorkspaces.length; i++) {
          if (this._myWorkspaces[i]['id'] === workspace) {
            this._myWorkspaceName = this._myWorkspaces[i]['name'];
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
    const currentWsId = this.myWorkspaceId;
    if (this._myWorkspaces.length > 0) {
      newWsId = this._myWorkspaces[0]['id'];
      for (let i = 0; i < this._myWorkspaces.length; i++) {
        if (this._myWorkspaces[i]['id'] === currentWsId) {
          newWsId = currentWsId;
          break;
        }
      }
      if (currentWsId !== newWsId) {
        this.myWorkspaceId = newWsId;
      } else {
        // to ensure loading of workspacelist in admincomponent
        this.workspaceChanged.emit(currentWsId);
      }
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
            (admintoken: string) => {
              this.adminToken = admintoken;
              this.communicationProblemMessage = '';
              this.router.navigateByUrl('/admin');
            }, (err: ServerError) => {
              this.communicationProblemMessage = err.label;
              if (err.code === 401) {
                this.adminToken = '';
              }
              this.router.navigateByUrl('/admin/blank');
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
          }, (err: ServerError) => {
            this.communicationProblemMessage = err.label;
            this.myLoginName = '';
            this.myWorkspaces = [];
            this.adminToken = '';
            this.router.navigateByUrl('/');
          }
        );
      }
    });
  }
}
