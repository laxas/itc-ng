import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatTabsModule, MatSelectModule, MatFormFieldModule } from '@angular/material';
import { StatusService } from './status.service';
import { BackendService, WorkspaceData, LoginStatusResponseData, ServerError } from './backend/backend.service';


@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  public navLinks = [
    {path: 'myfiles', label: 'Dateien'},
    {path: 'monitor', label: 'Monitor'},
    {path: 'results', label: 'Ergebnisse'}
  ];
  public isCommunicationProblem = false;
  public communicationProblemMessage = '';
  // public selectedWorkspace = 0;
  public myWorkspaces: WorkspaceData[];
  public wsSelector = new FormControl();

  // CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
  constructor(
    private ass: StatusService,
    private router: Router,
    private bs: BackendService
  ) {
    this.myWorkspaces = [];
  }

  // CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
  ngOnInit() {
    this.ass.communicationProblemChanged.subscribe((newstatus: boolean) => {
      this.isCommunicationProblem = newstatus;
      this.communicationProblemMessage = this.ass.communicationProblemMessage;
      if (this.isCommunicationProblem) {
        this.router.navigateByUrl('blank');
      }
    });

    this.ass.workspaceChanged.subscribe(isLoggedIn => {
      this.myWorkspaces = this.ass.myWorkspaces;
      this.wsSelector.setValue(this.ass.myWorkspaceId, {emitEvent: false});
    });

    this.wsSelector.valueChanges
      .subscribe(wsId => {
        this.ass.myWorkspaceId = wsId;
    });


    // loads workspaces and sets old or first workspace
    // due to the subscriptions above this Component will adapt
    this.bs.getStatus(this.ass.adminToken).subscribe(
      (rData: LoginStatusResponseData) => {
        this.ass.myWorkspaces = rData.workspaces;
        this.ass.myLoginName = rData.name;
        this.communicationProblemMessage = '';
      }, (err: ServerError) => {
        this.ass.communicationProblemMessage = err.label;
        if (err.code === 401) {
          this.ass.adminToken = '';
        }
    });
  }


}
