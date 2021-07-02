// Import statements
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientsComponent } from './clients/clients.component';
import { HomeComponent } from './home/home.component';
import { NetworksComponent } from './networks/networks.component';

const routes: Routes = [
  // Home route (Landingpage) - contains basic information about currently detected clients and networks
  {path:'home',component:HomeComponent},
  // Clients route - contains information about clients as well as visualizations of client data
  {path:'clients',component:ClientsComponent},
  // Networks route - contains information about currently detected networks
  {path:'networks',component:NetworksComponent},
  // Routes for redirecting every request to undefined routes to the home-Route
  {path:'',redirectTo:'/home',pathMatch:'full'},
  {path:'**',redirectTo:'/home',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
