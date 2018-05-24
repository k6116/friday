
// MODULES
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NouisliderModule } from 'ng2-nouislider';
import { ClickOutsideModule } from 'ng4-click-outside';

// ANGULAR MATERIAL MODULES
import { MatButtonModule, MatCheckboxModule, MatExpansionModule, MatProgressSpinnerModule } from '@angular/material';

// DIRECTIVES
import { AutofocusDirective } from './_shared/directives/autofocus.directive';
import { FteInputRestrictDirective } from './_shared/directives/fte-input-restrict.directive';

// PIPES
import { SafeHtmlPipe } from './_shared/pipes/safe-html.pipe';
import { FilterPipe } from './_shared/pipes/filter.pipe';

// SERVICES
import { ApiDataService } from './_shared/services/api-data.service';
import { AppDataService } from './_shared/services/app-data.service';
import { AuthService } from './auth/auth.service';
import { AuthGuardService } from './auth/auth-guard.service';
import { ToolsService } from './_shared/services/tools.service';
import { ClickTrackingService } from './_shared/services/click-tracking.service';
import { UserResolverService } from './_shared/services/user-resolver.service';

// COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { MainComponent } from './main/main.component';
import { NoticeModalComponent } from './modals/notice-modal/notice-modal.component';
import { ConfirmModalComponent } from './modals/confirm-modal/confirm-modal.component';
import { FteEntryEmployeeComponent } from './fte-entry/employee/fte-entry.component';
import { FteEntryTeamComponent } from './fte-entry/team/fte-entry.component';
import { TopNavComponent } from './navs/top-nav/top-nav.component';
import { SideNavComponent } from './navs/side-nav/side-nav.component';
import { ProjectsReportsComponent } from './reports/projects/projects.component';
import { EmployeesReportsComponent } from './reports/employees/employees.component';
import { ProjectsSetupsComponent } from './setups/projects/projects.component';
import { ProfileModalComponent } from './modals/profile-modal/profile-modal.component';
import { ProjectsModalComponent } from './modals/projects-modal/projects-modal.component';
import { TestComponent } from './test/test.component';
import { OrgDropdownComponent } from './reports/employees/org-dropdown/org-dropdown.component';
import { ProjectsInfoModalComponent } from './modals/projects-info-modal/projects-info-modal.component';
import { ProjectsEditModalComponent } from './modals/projects-edit-modal/projects-edit-modal.component';
import { ProjectsCreateModalComponent } from './modals/projects-create-modal/projects-create-modal.component';
import { ProjectsRosterModalComponent } from './modals/projects-roster-modal/projects-roster-modal.component';
import { ChartsModule } from 'ng2-charts';
import { ToastComponent } from './toast/toast.component';
import { BlockAppUseComponent } from './block-app-use/block-app-use.component';

// CHARTS
import 'hammerjs';
import 'chartjs-plugin-zoom';
import { PerformanceComponent } from './performance/performance.component';
import { ProgressBarComponent } from './_shared/components/progress-bar/progress-bar.component';
import { ProgressSpinnerComponent } from './_shared/components/progress-spinner/progress-spinner.component';
import { ClickOutsideDirective } from './_shared/directives/click-outside.directive';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AutofocusDirective,
    MainComponent,
    NoticeModalComponent,
    ConfirmModalComponent,
    SafeHtmlPipe,
    FteInputRestrictDirective,
    FteEntryEmployeeComponent,
    FteInputRestrictDirective,
    TopNavComponent,
    SideNavComponent,
    ProjectsReportsComponent,
    EmployeesReportsComponent,
    ProjectsSetupsComponent,
    FteEntryTeamComponent,
    ProfileModalComponent,
    ProjectsModalComponent,
    FilterPipe,
    TestComponent,
    OrgDropdownComponent,
    ProjectsEditModalComponent,
    ProjectsCreateModalComponent,
    ProjectsInfoModalComponent,
    ProjectsRosterModalComponent,
    ToastComponent,
    BlockAppUseComponent,
    PerformanceComponent,
    ProgressBarComponent,
    ProgressSpinnerComponent,
    ClickOutsideDirective
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    NouisliderModule,
    ClickOutsideModule,
    ChartsModule
  ],
  providers: [
    ApiDataService,
    AppDataService,
    AuthService,
    AuthGuardService,
    ToolsService,
    ClickTrackingService,
    UserResolverService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
