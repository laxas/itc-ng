import { TestdataService } from './../test-controller';
import { MessageDialogComponent, MessageDialogData, MessageType } from './../iqb-common';
import { MatDialog } from '@angular/material';
import { BackendService, SessionData, GetSessionsResponseData } from './../shared/backend.service';
import { Router } from '@angular/router';
import { GlobalStoreService } from './../shared/global-store.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  codeinputform: FormGroup;
  public showCodeinput: boolean;
  public showTeststartButtons: boolean;
  public select_message: string;
  private valid_codes: string[];
  private sessiondata: GetSessionsResponseData;
  private testlist: TestData[];
  private code = '';
  private isError = false;
  private errorMessage = '';


  constructor(private fb: FormBuilder,
    private gss: GlobalStoreService,
    private tss: TestdataService,
    public messsageDialog: MatDialog,
    private router: Router,
    private bs: BackendService) {
      this.showCodeinput = false;
      this.showTeststartButtons = true;
      this.select_message = 'Bitte warten.';
      this.valid_codes = [];
      this.testlist = [];
    }

  ngOnInit() {
    this.gss.updatePageTitle('IQB-Testcenter - Start');

    this.codeinputform = this.fb.group({
      code: this.fb.control('', [Validators.required, Validators.minLength(1)])
    });

    this.bs.getSessions(this.gss.loginToken).subscribe(
      (bdata: GetSessionsResponseData) => {
        this.sessiondata = bdata;
        for (const booklet of bdata.sessions) {
          if (booklet.codes.length > 0) {
            for (const code of booklet.codes) {
              if (!this.valid_codes.includes(code)) {
                this.valid_codes.push(code);
              }
            }
          }
        }
        if (this.valid_codes.length > 1) {
          this.showCodeinput = true;
          this.showTeststartButtons = false;
        } else {
          this.setTestselectButtons();
        }
      }, (errormsg: string) => {
        this.isError = true;
        this.select_message = errormsg;
      }
    );
  }

  // # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
  codeinput() {
    this.isError = false;
    this.errorMessage = '';
    if (this.setTestselectButtons()) {
      this.showCodeinput = false;
      this.showTeststartButtons = true;
    }
  }

  // # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
  setTestselectButtons(): boolean {
    let codeIsValid = true;
    this.testlist = [];
    if (this.valid_codes.length > 1) {
      this.code = this.codeinputform.get('code').value;
      codeIsValid = this.valid_codes.includes(this.code);
    }

    if (codeIsValid) {
      for (const booklet of this.sessiondata.sessions) {
        const myTest = {name: booklet.name, title: booklet.title, filename: booklet.filename};
        if (this.code.length > 0) {
          if (booklet.codes.length > 0) {
            if (booklet.codes.includes(this.code)) {
              this.testlist.push(myTest);
            }
          } else {
            this.testlist.push(myTest);
          }
        } else {
          this.testlist.push(myTest);
        }
      }
      if (this.testlist.length === 1) {
        this.select_message = 'Bitte klicken Sie auf den Schalter unten, um den Test zu starten!';
      } else {
        this.select_message = 'Bitte klicken Sie auf einen der Schalter unten, um den Test auszuwählen und zu starten!';
      }
      if (this.sessiondata.mode === 'trial') {
        this.select_message += ' Achtung: Dieser Test wird im Modus "trial" durchgeführt, d. h. es gelten keine ';
        this.select_message += 'Zeitbeschränkungen, aber die Navigation ist so beschränkt wie im normalen Test.';
      } else if (this.sessiondata.mode === 'review') {
        this.select_message += ' Achtung: Dieser Test wird im Modus "review" durchgeführt, d. h. es gelten keine ';
        this.select_message += 'Zeitbeschränkungen und die Navigation ist nicht beschränkt.';
        this.select_message += ' Nutzen Sie das Menü oben rechts, um Kommentare zu vergeben!';
      }
    } else {

      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Eingabe Kennwort für Test',
          content: 'Für dieses Kennwort wurde kein Test gefunden.',
          type: MessageType.error
        }
      });
    }

    return codeIsValid;
  }

  buttonStartTest(event) {
    let myElement = event.target;
    do {
      if (myElement.localName !== 'button') {
        myElement = myElement.parentElement;
      }
    } while (myElement.localName !== 'button');

    this.isError = false;
    this.errorMessage = '';
    this.bs.startSession(this.gss.loginToken, this.code, myElement.value).subscribe(
      (sessiontoken: string) => {
        this.tss.updateSessionToken(sessiontoken);
        this.tss.gotoFirstUnit();
      }, (errormsg: string) => {
        this.tss.updateSessionToken('');
        this.isError = true;
        this.errorMessage = errormsg;
      }
    );
  }
}

// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
export interface TestData {
  name: string;
  title: string;
  filename: string;
}
