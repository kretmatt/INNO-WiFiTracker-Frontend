import { Component, OnInit } from '@angular/core';
import { Network } from '../interfaces/network';
import { NetworksService } from '../services/networks.service';

@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.scss']
})
export class NetworksComponent implements OnInit {
  networks:Network[]=[];
  constructor(private networksService:NetworksService) { }

  ngOnInit(): void {
    this.networksService.getNetworks().subscribe(
      (data:any)=>{
        var networkJSON = data.data.networks.filter((n:any)=>!(n.BSSID==="BSSID"||n.BSSID===""||n.BSSID==="Station MAC"));
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
