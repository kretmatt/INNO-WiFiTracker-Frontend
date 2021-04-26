import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule} from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { HomeComponent } from './home/home.component';
import {HttpClientModule} from '@angular/common/http';
import { ClientsComponent } from './clients/clients.component';
import { ClientComponent } from './client/client.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { NetworksComponent } from './networks/networks.component';
import { NetworkComponent } from './network/network.component';
import {MatGridListModule} from '@angular/material/grid-list'; 
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    ClientsComponent,
    ClientComponent,
    NetworksComponent,
    NetworkComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    HttpClientModule,
    MatExpansionModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
