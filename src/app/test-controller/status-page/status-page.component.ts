import { TestdataService } from './../testdata.service';
import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './status-page.component.html',
  styleUrls: ['./status-page.component.css']
})
export class StatusPageComponent implements OnInit {
  private isProblem: boolean;
  private problemMessage: string;

  constructor(
    private tss: TestdataService
  ) {
    this.isProblem = false;
    this.problemMessage = '';
  }

  ngOnInit() {
    this.isProblem = this.tss.isProblem;
    this.problemMessage = this.tss.problemMessage;

    this.tss.problemArising.subscribe((problem: string) => {
      if (problem.length > 0) {
        this.isProblem = true;
        this.problemMessage = problem;
      } else {
        this.isProblem = false;
        this.problemMessage = '';
      }
    });
  }
}
