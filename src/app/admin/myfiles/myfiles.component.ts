import { StatusService } from './../status.service';
import { ConfirmDialogComponent, ConfirmDialogData, MessageDialogComponent,
  MessageDialogData, MessageType } from './../../iqb-common';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material';
import { BackendService, GetFileResponseData } from './../backend/backend.service';
import { Input, Output, EventEmitter, Component, OnInit, Inject, ElementRef } from '@angular/core';
import { NgModule, ViewChild } from '@angular/core';
import { MatSort, MatDialog } from '@angular/material';
import { HttpEventType, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { IqbFileUploadQueueComponent, IqbFileUploadInputForDirective } from './../../iqb-files';


@Component({
  templateUrl: './myfiles.component.html',
  styleUrls: ['./myfiles.component.css']
})
export class MyfilesComponent implements OnInit {
  public serverfiles: MatTableDataSource<GetFileResponseData>;
  public displayedColumns = ['checked', 'filename', 'typelabel', 'filesize', 'filedatetime'];
  public uploadUrl = 'http://ocba2.iqb.hu-berlin.de/uploadFile.php';
  public fileNameAlias = 'fileforopencba';
  public dataLoading = false;

  // for iqb-FileUpload
  public token = '';
  public workspace = 0;

  @ViewChild(MatSort) sort: MatSort;

  constructor(private bs: BackendService,
    private ass: StatusService,
    public confirmDialog: MatDialog,
    public messsageDialog: MatDialog,
    public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.ass.workspaceChanged.subscribe(newWS => {
      this.updateFileList(1);
      this.workspace = newWS;
    });

    this.workspace = this.ass.myWorkspaceId;
    this.token = this.ass.adminToken;
    this.updateFileList(1); // Dummy-Parameter um zu verhindern, dass MatSnackBar anspringt
  }

  // ***********************************************************************************
  checkAll(isChecked: boolean) {
    this.serverfiles.data.forEach(element => {
      element.isChecked = isChecked;
    });
  }

  // ***********************************************************************************
  deleteFiles() {
    const filesToDelete = [];
    this.serverfiles.data.forEach(element => {
      if (element.isChecked) {
        filesToDelete.push(element.type + '::' + element.filename);
      }
    });

    if (filesToDelete.length > 0) {
      const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Löschen von Dateien',
          content: 'Sie haben ' + filesToDelete.length + ' Dateien ausgewählt. Sollen diese gelöscht werden?',
          confirmbuttonlabel: 'Löschen'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          // =========================================================
          this.dataLoading = true;
          this.bs.deleteFiles(this.ass.adminToken, this.ass.myWorkspaceId, filesToDelete).subscribe(
            (deletefilesresponse: string) => {
              if ((deletefilesresponse.length > 5) && (deletefilesresponse.substr(0, 2) === 'e:')) {
                this.snackBar.open(deletefilesresponse.substr(2), 'Fehler', {duration: 1000});
              } else {
                this.updateFileList(deletefilesresponse);
              }
            }, (errormsg: string) => {
             this.ass.communicationProblemMessage = errormsg;
            });
          // =========================================================
        }
      });
    } else {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Löschen von Dateien',
          content: 'Bitte markieren Sie erst Dateien!',
          type: MessageType.error
        }
      });
    }

  }

  // ***********************************************************************************
  updateFileList(eventdata: any) {
    this.dataLoading = true;
    if (typeof eventdata === 'string') {
      this.snackBar.open(eventdata, '', {duration: 1000});
    }
    if (this.ass.myWorkspaceId === 0) {
      this.serverfiles = null;
      this.dataLoading = false;
    } else {
      this.bs.getFiles(this.ass.adminToken, this.ass.myWorkspaceId).subscribe(
        (filedataresponse: GetFileResponseData[]) => {
          this.serverfiles = new MatTableDataSource(filedataresponse);
          this.serverfiles.sort = this.sort;
          this.dataLoading = false;
        }, (errormsg: string) => {
          this.ass.communicationProblemMessage = errormsg;
          this.dataLoading = false;
        }
      );
    }
  }
}