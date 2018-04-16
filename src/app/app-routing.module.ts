import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { MainComponent } from './main/main.component';
import { FteEntryComponent } from './fte-entry/fte-entry.component';
import { ProjectsSetupsComponent } from './setups/projects/projects.component';
import { ProjectsReportsComponent } from './reports/projects/projects.component';
import { EmployeesReportsComponent } from './reports/employees/employees.component';

import { AuthGuardService } from './auth/auth-guard.service';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'main', component: MainComponent, canActivate: [AuthGuardService] },
  { path: 'fte-entry/you', component: EmployeesReportsComponent, canActivate: [AuthGuardService] },
  { path: 'setups/projects', component: ProjectsSetupsComponent, canActivate: [AuthGuardService] },
  { path: 'reports/projects', component: ProjectsReportsComponent, canActivate: [AuthGuardService] },
  { path: 'reports/employees', component: EmployeesReportsComponent, canActivate: [AuthGuardService] },
  { path: '**', redirectTo: '/login' }
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
