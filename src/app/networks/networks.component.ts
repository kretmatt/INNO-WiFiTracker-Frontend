import { Component, OnInit } from '@angular/core';
import { Observable, Subscription,interval } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Network } from '../interfaces/network';
import { NetworksService } from '../services/networks.service';

@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.scss']
})
export class NetworksComponent implements OnInit {
  timeOfScan:Date=new Date();
  networks:Network[]=[];
  subscription:Subscription=new Subscription();
  constructor(private networksService:NetworksService) { }

  ngOnInit(): void {
   this.receiveData();
   this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }

  receiveData(){
    this.networksService.getNetworks().subscribe(
      (data:any)=>{
        this.timeOfScan=new Date(data.timeOfScan);
        var networkJSON = data.data.networks.filter((n:any)=>!(n.BSSID==="BSSID"||n.BSSID===""||n.BSSID==="Station MAC"));
        this.networks=[];
        networkJSON.forEach((n:any) => {
          this.networks.push({
            BSSID:n.BSSID,
            essid:n.ESSID,
            ip:+n.IP,
            iv:+n.IV,
            authentication:n.authentication,
            beacons:+n.beacons,
            channel:+n.channel,
            cipher:n.cipher,
            firstTimeSeen:n.firstTimeSeen,
            lastTimeSeen:n.lastTimeSeen,
            power:+n.power,
            privacy:n.privacy,
            speed:+n.speed
          });
        });
        this.networks=this.networks.filter((n:Network)=>!(n.authentication===undefined||n.beacons===NaN||n.essid===undefined||n.ip===NaN||n.iv===NaN||n.power===NaN));
      }
    );
  }

}
