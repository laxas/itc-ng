import { TestdataService } from './testdata.service';
import { BackendService } from './backend.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestControllerRoutingModule } from './test-controller-routing.module';
import { LoadingComponent } from './loading/loading.component';
import { FrameComponent } from './frame/frame.component';
import { MatProgressSpinnerModule } from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    TestControllerRoutingModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    LoadingComponent,
    FrameComponent
  ],
  providers: [
    TestdataService,
    BackendService
  ],
  exports: [
    FrameComponent
  ]
})
export class TestControllerModule { }
