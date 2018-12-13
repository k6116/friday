
// MODULES
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NouisliderModule } from 'ng2-nouislider';
import { ClickOutsideModule } from 'ng4-click-outside';
import { TreeModule } from 'angular-tree-component';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

// ANGULAR MATERIAL MODULES
import { MatSlideToggleModule, MatButtonModule, MatCheckboxModule, MatExpansionModule, MatProgressSpinnerModule } from '@angular/material';

// DIRECTIVES
import { AutofocusDirective } from './_shared/directives/autofocus.directive';
import { FteInputRestrictDirective } from './_shared/directives/fte-input-restrict.directive';
import { ClickOutsideDirective } from './_shared/directives/click-outside.directive';

// PIPES
import { SafeHtmlPipe } from './_shared/pipes/safe-html.pipe';
import { FilterPipe } from './_shared/pipes/filter.pipe';
import { ProjectTypePipe } from './_shared/pipes/project-type.pipe';
import { TitleCasePipe } from '@angular/common';
import { ProjectsFilterPipe } from './_shared/pipes/projects-filter.pipe';

// SERVICES
import { BomService, CacheService, ClickTrackingService, CookiesService, LoggingService,
  ToolsService, UserResolverService, WebsocketService, RoutingHistoryService, ExcelExportService } from './_shared/services/_index';
import { AuthService } from './_shared/services/auth.service';
import { ApiDataAdvancedFilterService, ApiDataAuthService, ApiDataClickTrackingService, ApiDataEmailService, ApiDataEmployeeService,
  ApiDataFteService, ApiDataJobTitleService, ApiDataLogService, ApiDataMetaDataService, ApiDataOrgService,
  ApiDataPermissionService, ApiDataProjectService, ApiDataReportService, ApiDataDashboardService, ApiDataSchedulesService,
  ApiDataPartService, ApiDataAnalyticsService, ApiDataBomService, ApiDataMatplanService} from './_shared/services/api-data/_index';

// GUARDS
import { AuthGuardService } from './_shared/guards/auth.guard';
import { UnsavedChangesGuard } from './_shared/guards/unsaved-changes.guard';
import { BrowserGuard } from './_shared/guards/browser.guard';
import { PermissionsGuard } from './_shared/guards/permissions.guard';
import { FteEntryGuard } from './fte-entry/employee/fte-entry.guard';
import { FteTeamEntryGuard } from './fte-entry/team/fte-entry.guard';

// CHARTS
import 'hammerjs';
import 'chartjs-plugin-zoom';

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
import { TopProjectsReportsComponent } from './reports/top-projects/top-projects.component';
import { EmployeesReportsComponent } from './reports/employees/employees.component';
import { ProfileModalComponent } from './modals/profile-modal/profile-modal.component';
import { ProjectsModalComponent } from './modals/projects-modal/projects-modal.component';
import { TestComponent } from './test/test.component';
import { OrgDropdownComponent } from './reports/employees/org-dropdown/org-dropdown.component';
import { ProjectsEditModalComponent } from './modals/projects-edit-modal/projects-edit-modal.component';
import { ProjectsCreateModalComponent } from './modals/projects-create-modal/projects-create-modal.component';
import { ChartsModule } from 'ng2-charts';
import { ToastComponent } from './toast/toast.component';
import { BlockAppUseComponent } from './block-app-use/block-app-use.component';
import { PerformanceComponent } from './performance/performance.component';
import { ProgressBarComponent } from './_shared/components/progress-bar/progress-bar.component';
import { ProgressSpinnerComponent } from './_shared/components/progress-spinner/progress-spinner.component';
import { ChatComponent } from './chat/chat.component';
import { MyFteSummaryComponent } from './reports/my-fte-summary/my-fte-summary.component';
import { TeamFteSummaryComponent } from './reports/team-fte-summary/team-fte-summary.component';
import { TopProjectsBubbleComponent } from './reports/top-projects-bubble/top-projects-bubble.component';
import { JobTitlesComponent } from './admin/job-titles/job-titles.component';
import { AdminComponent } from './admin/admin.component';
import { ProjectAttributesComponent } from './admin/project-attributes/project-attributes.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FooterComponent } from './footer/footer.component';
import { ProjectsSetupsComponent } from './setups/projects/projects.component';
import { CarouselModalComponent } from './modals/carousel-modal/carousel-modal.component';
import { PartSetupComponent } from './setups/parts/parts.component';
import { SupplyDemandComponent } from './reports/supply-demand/supply-demand.component';
import { Error403Component } from './error-pages/error-403/error-403.component';
import { BomDrawD3Component } from './bom/bom-draw-d3/bom-draw-d3.component';
import { BomEditorComponent } from './bom/bom-editor/bom-editor.component';
import { BomSelectorComponent } from './bom/bom-selector/bom-selector.component';
import { BomViewerComponent } from './bom/bom-viewer/bom-viewer.component';
import { SearchProjectsComponent } from './projects/search-projects/search-projects.component';
import { MyProjectsComponent } from './projects/my-projects/my-projects.component';
import { ProjectRequestsComponent } from './projects/project-requests/project-requests.component';
import { TeamRolesComponent } from './setups/team-roles/team-roles.component';
import { DisplayProjectComponent } from './projects/display-project/display-project.component';
import { UnitTestComponent } from './unit-test/unit-test.component';
import { ProjectFteRollupComponent } from './reports/project-fte-rollup/project-fte-rollup.component';
import { TransferProjectsComponent } from './setups/transfer-projects/transfer-projects.component';
import { MatplanSelectorComponent } from './matplan/matplan-selector/matplan-selector.component';
import { MatplanEditorComponent } from './matplan/matplan-editor/matplan-editor.component';
import { MatplanInfoComponent } from './matplan/matplan-info/matplan-info.component';
import { MatplanBomComponent } from './matplan/matplan-bom/matplan-bom.component';
import { MatplanQuoteComponent } from './matplan/matplan-quote/matplan-quote.component';
import { MatplanOrderComponent } from './matplan/matplan-order/matplan-order.component';
import { OrgViewerComponent } from './reports/org/org-viewer/org-viewer.component';
import { OrgDrawD3Component } from './reports/org/org-draw-d3/org-draw-d3.component';
import { AdvancedDashboardComponent } from './projects/advanced-dashboard/advanced-dashboard.component';
import { AdvancedFiltersComponent } from './projects/advanced-filters/advanced-filters.component';
import { AdvancedSearchResultsComponent } from './projects/advanced-filters/advanced-search-results/advanced-search-results.component';
import { SpinnerComponent } from './_shared/components/spinner/spinner.component';
import { TeamSelectModalComponent } from './dashboard/modal/team-select-modal/team-select-modal.component';
import { TeamSelectDropdownComponent } from './dashboard/modal/team-select-dropdown/team-select-dropdown.component';
import { TeamFteSummaryTeamSelectModalComponent
  } from './reports/team-fte-summary/modal/team-fte-summary-team-select-modal/team-fte-summary-team-select-modal.component';
import { TeamFteSummaryTeamSelectDropdownComponent
  } from './reports/team-fte-summary/modal/team-fte-summary-team-select-dropdown/team-fte-summary-team-select-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AutofocusDirective,
    MainComponent,
    NoticeModalComponent,
    ConfirmModalComponent,
    SafeHtmlPipe,
    ProjectsFilterPipe,
    FteInputRestrictDirective,
    FteEntryEmployeeComponent,
    TopNavComponent,
    SideNavComponent,
    TopProjectsReportsComponent,
    EmployeesReportsComponent,
    MyProjectsComponent,
    FteEntryTeamComponent,
    ProfileModalComponent,
    ProjectsModalComponent,
    FilterPipe,
    ProjectTypePipe,
    TestComponent,
    OrgDropdownComponent,
    ProjectsEditModalComponent,
    ProjectsCreateModalComponent,
    ToastComponent,
    BlockAppUseComponent,
    PerformanceComponent,
    ProgressBarComponent,
    ProgressSpinnerComponent,
    ClickOutsideDirective,
    ChatComponent,
    MyFteSummaryComponent,
    TeamFteSummaryComponent,
    TopProjectsBubbleComponent,
    JobTitlesComponent,
    AdminComponent,
    ProjectAttributesComponent,
    FooterComponent,
    DashboardComponent,
    FooterComponent,
    ProjectsSetupsComponent,
    CarouselModalComponent,
    SupplyDemandComponent,
    Error403Component,
    PartSetupComponent,
    BomDrawD3Component,
    BomEditorComponent,
    BomSelectorComponent,
    BomViewerComponent,
    ProjectRequestsComponent,
    SearchProjectsComponent,
    TeamRolesComponent,
    DisplayProjectComponent,
    UnitTestComponent,
    ProjectFteRollupComponent,
    MatplanSelectorComponent,
    MatplanEditorComponent,
    MatplanInfoComponent,
    MatplanBomComponent,
    MatplanQuoteComponent,
    MatplanOrderComponent,
    OrgViewerComponent,
    OrgDrawD3Component,
    TransferProjectsComponent,
    TeamSelectModalComponent,
    TeamSelectDropdownComponent,
    TeamFteSummaryTeamSelectModalComponent,
    TeamFteSummaryTeamSelectDropdownComponent,
    AdvancedFiltersComponent,
    AdvancedSearchResultsComponent,
    AdvancedDashboardComponent,
    SpinnerComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    NouisliderModule,
    ClickOutsideModule,
    ChartsModule,
    TreeModule.forRoot(),
    MultiselectDropdownModule
  ],
  providers: [
    ApiDataAdvancedFilterService,
    ApiDataAuthService,
    ApiDataClickTrackingService,
    ApiDataEmailService,
    ApiDataEmployeeService,
    ApiDataFteService,
    ApiDataJobTitleService,
    ApiDataLogService,
    ApiDataMetaDataService,
    ApiDataOrgService,
    ApiDataPermissionService,
    ApiDataProjectService,
    ApiDataReportService,
    ApiDataDashboardService,
    ApiDataSchedulesService,
    ApiDataPartService,
    ApiDataAnalyticsService,
    ApiDataBomService,
    ApiDataMatplanService,
    BomService,
    CacheService,
    AuthService,
    AuthGuardService,
    ToolsService,
    ClickTrackingService,
    UserResolverService,
    WebsocketService,
    CookiesService,
    UnsavedChangesGuard,
    BrowserGuard,
    PermissionsGuard,
    FteEntryGuard,
    FteTeamEntryGuard,
    TitleCasePipe,
    RoutingHistoryService,
    ExcelExportService,
    LoggingService,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
