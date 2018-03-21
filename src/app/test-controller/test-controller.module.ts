import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestControllerRoutingModule } from './test-controller-routing.module';
import { LoadingComponent } from './loading/loading.component';
import { FrameComponent } from './frame/frame.component';

@NgModule({
  imports: [
    CommonModule,
    TestControllerRoutingModule
  ],
  declarations: [
    LoadingComponent,
    FrameComponent
  ],
  exports: [
    FrameComponent
  ]
})
export class TestControllerModule { }
