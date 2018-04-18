import { UnithostComponent } from './unithost/unithost.component';
import { TestControllerComponent } from './test-controller.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: 't',
    component: TestControllerComponent,
    children: [
      {path: '', redirectTo: 'u/msg', pathMatch: 'full'},
      {path: 'u', redirectTo: 'u/msg', pathMatch: 'full'},
      {path: 'u/:u', component: UnithostComponent}
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestControllerRoutingModule { }
