import { UnithostComponent } from './unithost/unithost.component';
import { TestControllerComponent } from './test-controller.component';
import { StatusPageComponent } from './status-page/status-page.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: 't',
    component: TestControllerComponent,
    children: [
      {path: '', redirectTo: 'p', pathMatch: 'full'},
      {path: 'p', component: StatusPageComponent},
      {path: 'u/:u', component: UnithostComponent},
      {path: '**', component: StatusPageComponent}
    ]
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestControllerRoutingModule { }
