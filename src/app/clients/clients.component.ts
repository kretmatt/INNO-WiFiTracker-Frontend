import { Component, OnInit } from '@angular/core';
import { MatTab } from '@angular/material/tabs';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Client } from '../interfaces/client';
import { ClientsService } from '../services/clients.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  timeOfScan:Date=new Date();
  clients:Client[]=[];
  subscription:Subscription=new Subscription();
  constructor(private clientService: ClientsService) { }

  ngOnInit(): void {
    this.receiveData();
    this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }

  calculateDistance(powerLevel:number, frequency:number){
    var exponent = (27.55-(20*Math.log10(frequency))+Math.abs(powerLevel))/20;
    return Math.pow(10,exponent);
  }

  receiveData(){
    this.clientService.getClients().subscribe(
      (data:any)=>{
        this.timeOfScan=new Date(data.timeOfScan);
        var clientJSON = data.data.clients.filter((c:any)=>!(c.MAC==="BSSID"||c.MAC===""||c.MAC==="Station MAC"));
        this.clients=[];
        clientJSON.forEach((c:any) => {
          this.clients.push({
            MAC:c.MAC,
            power:+c.power,
            firstTimeSeen:c.firstTimeSeen,
            lastTimeSeen:c.lastTimeSeen,
            packets:+c.packets,
            BSSID:c.BSSID,
            probes:c.probes,
            distance24:this.calculateDistance(+c.power,2400),
            distance5:this.calculateDistance(+c.power,5000)
          });
        });

      }
    );
  }


}
