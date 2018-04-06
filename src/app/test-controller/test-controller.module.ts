import { TestdataService } from './testdata.service';
import { BackendService } from './backend.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestControllerRoutingModule } from './test-controller-routing.module';
import { LoadingComponent } from './loading/loading.component';
import { UnithostComponent } from './unithost/unithost.component';
import { MatProgressSpinnerModule } from '@angular/material';
import { StatusPageComponent } from './status-page/status-page.component';
import { TestControllerComponent } from './test-controller.component';


@NgModule({
  imports: [
    CommonModule,
    TestControllerRoutingModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    LoadingComponent,
    UnithostComponent,
    StatusPageComponent,
    TestControllerComponent
  ],
  providers: [
    TestdataService,
    BackendService
  ],
  exports: [
    TestControllerComponent
  ]
})
export class TestControllerModule { }
