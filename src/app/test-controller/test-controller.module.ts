import { TestdataService } from './testdata.service';
import { BackendService } from './backend.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestControllerRoutingModule } from './test-controller-routing.module';
import { LoadingComponent } from './loading/loading.component';
import { UnithostComponent } from './unithost/unithost.component';
import { MatProgressSpinnerModule } from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    TestControllerRoutingModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    LoadingComponent,
    UnithostComponent
  ],
  providers: [
    TestdataService,
    BackendService
  ],
  exports: [
    UnithostComponent
  ]
})
export class TestControllerModule { }
