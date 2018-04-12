
// MODULES
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NouisliderModule } from 'ng2-nouislider';

// ANGULAR MATERIAL MODULES
import { MatButtonModule, MatCheckboxModule, MatExpansionModule } from '@angular/material';

// DIRECTIVES
import { AutofocusDirective } from './_shared/directives/autofocus.directive';
import { FteInputRestrictDirective } from './_shared/directives/fte-input-restrict.directive';

// PIPES
import { SafeHtmlPipe } from './_shared/pipes/safe-html.pipe';

// SERVICES
import { ApiDataService } from './_shared/services/api-data.service';
import { AppDataService } from './_shared/services/app-data.service';
import { AuthService } from './auth/auth.service';
import { AuthGuardService } from './auth/auth-guard.service';
import { ToolsService } from './_shared/services/tools.service';

// COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { MainComponent } from './main/main.component';
import { NoticeModalComponent } from './modals/notice-modal/notice-modal.component';
import { ConfirmModalComponent } from './modals/confirm-modal/confirm-modal.component';
import { FteEntryComponent } from './fte-entry/fte-entry.component';
import { OrgComponent } from './org/org.component';
import { OrgTreeComponent } from './org-tree/org-tree.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AutofocusDirective,
    MainComponent,
    NoticeModalComponent,
    ConfirmModalComponent,
    SafeHtmlPipe,
    FteEntryComponent,
    OrgComponent,
    OrgTreeComponent,
    FteInputRestrictDirective
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
    NouisliderModule
  ],
  providers: [
    ApiDataService,
    AppDataService,
    AuthService,
    AuthGuardService,
    ToolsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
