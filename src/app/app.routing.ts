import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';

const routes: Routes = [
  { path: '', redirectTo: '/app', pathMatch: 'full' },
  { path: 'app', component: AppComponent },
  { path: '**', redirectTo: '/app' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ],
  exports: [ RouterModule ],
  declarations: []
})
export class AppRoutingModule {

}
