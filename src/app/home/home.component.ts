import { Component, OnInit } from '@angular/core';
import { Client } from '../interfaces/client';
import { ClientsService } from '../services/clients.service';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  subscription:Subscription=new Subscription();
  clients:Client[]=[];
  timeOfScan:Date=new Date();

  constructor(private clientService: ClientsService) { }

  ngOnInit(): void {
    this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
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
            distance24:c.distance_2_4ghz,
            distance5:c.distance_5ghz,
            timeOfScan:new Date(data.timeOfScan)
          });      
        });
      }
    );
  }
}
