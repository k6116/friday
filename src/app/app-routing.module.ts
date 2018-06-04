import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { MainComponent } from './main/main.component';
import { FteEntryEmployeeComponent } from './fte-entry/employee/fte-entry.component';
import { FteEntryTeamComponent } from './fte-entry/team/fte-entry.component';
import { ProjectsSetupsComponent } from './setups/projects/projects.component';
import { TopProjectsReportsComponent } from './reports/top-projects/top-projects.component';
import { MyFteSummaryComponent } from './reports/my-fte-summary/my-fte-summary.component';
import { TeamFteSummaryComponent } from './reports/team-fte-summary/team-fte-summary.component';
import { EmployeesReportsComponent } from './reports/employees/employees.component';
import { BlockAppUseComponent } from './block-app-use/block-app-use.component';

import { AuthGuardService } from './auth/auth-guard.service';
import { UnsavedChangesGuard } from './_shared/unsaved-changes-guard.guard';
import { TestComponent } from './test/test.component';
import { PerformanceComponent } from './performance/performance.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'block', component: BlockAppUseComponent },
  { path: 'test', component: TestComponent },
  { path: 'perf', component: PerformanceComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: '', redirectTo: 'fte-entry/employee', pathMatch: 'full', canActivate: [AuthGuardService] },
      { path: 'fte-entry/employee', component: FteEntryEmployeeComponent,
        canActivate: [AuthGuardService], canDeactivate: [UnsavedChangesGuard] },
      { path: 'fte-entry/team', component: FteEntryTeamComponent, canActivate: [AuthGuardService] },
      { path: 'setups/projects', component: ProjectsSetupsComponent, canActivate: [AuthGuardService] },
      { path: 'reports/my-fte-summary', component: MyFteSummaryComponent, canActivate: [AuthGuardService] },
      { path: 'reports/team-fte-summary', component: TeamFteSummaryComponent, canActivate: [AuthGuardService] },
      { path: 'reports/top-projects', component: TopProjectsReportsComponent, canActivate: [AuthGuardService] },
      { path: 'reports/employees', component: EmployeesReportsComponent, canActivate: [AuthGuardService] },
    ]
  },
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
