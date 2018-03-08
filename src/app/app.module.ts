
// MODULES
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app.routing';

// SERVICES
import { ApiDataService } from './_shared/services/api-data.service';
import { AppDataService } from './_shared/services/app-data.service';

// COMPONENTS
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    ApiDataService,
    AppDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
