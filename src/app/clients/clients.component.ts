import { Component, OnInit } from '@angular/core';
import { MatTab } from '@angular/material/tabs';
import { Client } from '../interfaces/client';
import { ClientsService } from '../services/clients.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  clients:Client[]=[];
  constructor(private clientService: ClientsService) { }

  ngOnInit(): void {
    this.clientService.getClients().subscribe(
      (data:any)=>{
        var clientJSON = data.data.clients.filter((c:any)=>!(c.MAC==="BSSID"||c.MAC===""||c.MAC==="Station MAC"));
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

  calculateDistance(powerLevel:number, frequency:number){
    var exponent = (27.55-(20*Math.log10(frequency))+Math.abs(powerLevel))/20;
    return Math.pow(10,exponent);
  }


}
