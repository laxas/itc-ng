import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatTabsModule, MatSelectModule, MatFormFieldModule } from '@angular/material';
import { StatusService } from './status.service';
import { BackendService, WorkspaceData, LoginStatusResponseData } from './backend/backend.service';


@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  public navLinks = [
    {path: 'myfiles', label: 'Dateien'},
    {path: 'results', label: 'Monitor'}
  ];
  public isCommunicationProblem = false;
  public communicationProblemMessage = '';
  // public selectedWorkspace = 0;
  public myWorkspaces: WorkspaceData[];
  public wsSelector = new FormControl();

  // CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
  constructor(
    private ass: StatusService,
    private bs: BackendService
  ) {
    this.myWorkspaces = [];
  }

  // CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
  ngOnInit() {
    this.myWorkspaces = this.ass.myWorkspaces;
    // this.selectedWorkspace = this.ass.myWorkspaceId;
    this.isCommunicationProblem = this.ass.isCommunicationProblem;
    this.communicationProblemMessage = this.ass.communicationProblemMessage;

    this.ass.communicationProblemChanged.subscribe((newstatus: boolean) => {
      this.isCommunicationProblem = newstatus;
      this.communicationProblemMessage = this.ass.communicationProblemMessage;
    });

    this.ass.workspaceChanged.subscribe(isLoggedIn => {
      this.myWorkspaces = this.ass.myWorkspaces;
      // this.selectedWorkspace = this.ass.myWorkspaceId;
      this.wsSelector.setValue(this.ass.myWorkspaceId, {emitEvent: false});
      console.log('.:' + this.ass.myWorkspaceId);
    });

    this.wsSelector.valueChanges
      .subscribe(wsId => {
        this.ass.myWorkspaceId = wsId;
        console.log('.:xx' + typeof wsId);
      });

    this.ass.loadStatus();
  }


}
