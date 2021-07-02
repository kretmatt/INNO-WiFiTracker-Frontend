// Import statements
import { Component, OnInit } from '@angular/core';
import { Client } from '../interfaces/client';
import { ClientsService } from '../services/clients.service';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Properties necessary for making a subscription to ClientsService, retrieving data from API and storing them for 
  subscription:Subscription=new Subscription();
  clients:Client[]=[];
  // Date of the last scan
  timeOfScan:Date=new Date();

  // Inject ClientsService in the constructor
  constructor(private clientService: ClientsService) { }

  // Retrieve clients data and set up subscription
  ngOnInit(): void {
    this.receiveData();
    this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
  }
  // Unsubscribe from subscription to avoid unnecessary requests to API after the component is destroyed
  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }
  
  receiveData(){
    this.clientService.getClients().subscribe(
      (data:any)=>{
        // Set timeOfScan to the latest scan
        this.timeOfScan=new Date(data.timeOfScan);
        // Remove invalid data
        var clientJSON = data.data.clients.filter((c:any)=>!(c.MAC==="BSSID"||c.MAC===""||c.MAC==="Station MAC"));
        // Clear clients data
        this.clients=[];
        // Push new data into clients-array
        clientJSON.forEach((c:any) => {
          this.clients.push({
            MAC:c.MAC,
            power:+c.power,
            firstTimeSeen:c.firstTimeSeen,
            lastTimeSeen:c.lastTimeSeen,
            packets:+c.packets,
            BSSID:c.BSSID,
            probes:c.probes,
            distance24:c.distance_2_4ghz,
            distance5:c.distance_5ghz,
            timeOfScan:new Date(data.timeOfScan)
          });      
        });
      }
    );
  }
}
