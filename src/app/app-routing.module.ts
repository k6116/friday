import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { MainComponent } from './main/main.component';
import { FteEntryEmployeeComponent } from './fte-entry/employee/fte-entry.component';
import { FteEntryTeamComponent } from './fte-entry/team/fte-entry.component';
import { MyProjectsComponent } from './projects/my-projects/my-projects.component';
import { ProjectRequestsComponent } from './projects/project-requests/project-requests.component';
import { BrowseProjectsComponent } from './projects/browse-projects/browse-projects.component';
import { TopProjectsReportsComponent } from './reports/top-projects/top-projects.component';
import { TopProjectsBubbleComponent } from './reports/top-projects-bubble/top-projects-bubble.component';
import { MyFteSummaryComponent } from './reports/my-fte-summary/my-fte-summary.component';
import { TeamFteSummaryComponent } from './reports/team-fte-summary/team-fte-summary.component';
import { EmployeesReportsComponent } from './reports/employees/employees.component';
import { SupplyDemandComponent } from './reports/supply-demand/supply-demand.component';
import { BlockAppUseComponent } from './block-app-use/block-app-use.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponent } from './test/test.component';
import { ChatComponent } from './chat/chat.component';
import { PerformanceComponent } from './performance/performance.component';
import { UserResolverService } from './_shared/services/user-resolver.service';
import { Error403Component } from './error-pages/error-403/error-403.component';
import { BomEditorComponent } from './reports/bom-editor/bom-editor.component';
import { BomViewerComponent } from './reports/bom-viewer/bom-viewer.component';

import { AuthGuardService } from './_shared/guards/auth.guard';

import { UnsavedChangesGuard } from './_shared/guards/unsaved-changes.guard';
import { BrowserGuard } from './_shared/guards/browser.guard';
import { PermissionsGuard } from './_shared/guards/permissions.guard';
import { FteEntryGuard } from './fte-entry/employee/fte-entry.guard';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'block', component: BlockAppUseComponent },
  { path: 'test', component: TestComponent, canActivate: [BrowserGuard] },
  { path: 'perf', component: PerformanceComponent, canActivate: [BrowserGuard] },
  { path: 'login', component: LoginComponent, canActivate: [BrowserGuard] },
  { path: 'error403', component: Error403Component },
  {
    path: 'main', component: MainComponent, canActivate: [BrowserGuard, AuthGuardService], resolve: { loggedInUser: UserResolverService },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'fte-entry/employee', component: FteEntryEmployeeComponent,
        canActivate: [FteEntryGuard], canDeactivate: [UnsavedChangesGuard] },
      { path: 'fte-entry/team', component: FteEntryTeamComponent },
      { path: 'projects/my-projects', component: MyProjectsComponent },
      { path: 'projects/requests', component: ProjectRequestsComponent },
      { path: 'projects/search', component: BrowseProjectsComponent },
      { path: 'reports/bom-editor', component: BomEditorComponent },
      { path: 'reports/bom-viewer', component: BomViewerComponent },
      { path: 'reports/my-fte-summary', component: MyFteSummaryComponent },
      { path: 'reports/team-fte-summary', component: TeamFteSummaryComponent },
      { path: 'reports/top-projects', component: TopProjectsReportsComponent },
      { path: 'reports/top-projects-bubble', component: TopProjectsBubbleComponent },
      { path: 'reports/employees', component: EmployeesReportsComponent },
      { path: 'reports/supply-demand', component: SupplyDemandComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'admin', component: AdminComponent, canActivate: [PermissionsGuard] },
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
