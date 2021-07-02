// Import statements
import { Component, OnInit } from '@angular/core';
import { Subscription,interval } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Network } from '../interfaces/network';
import { NetworksService } from '../services/networks.service';

@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.scss']
})
export class NetworksComponent implements OnInit {
  
  // Time / Date of the last scan
  timeOfScan:Date=new Date();
  // Networks that were included in the last scan
  networks:Network[]=[];
  // Subscription for retrieving network-Data from API
  subscription:Subscription=new Subscription();

  // Inject NetworksService instance in constructor
  constructor(private networksService:NetworksService) { }

  // Retrieve networks data and set up subscription property
  ngOnInit(): void {
   this.receiveData();
   this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
  }

  // Unsubscribe from subscription to prevent unnecessary requests to the API although networks-component isn't loaded
  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }


  receiveData(){
    this.networksService.getNetworks().subscribe(
      (data:any)=>{
        // Set timeOfScan to latest scan
        this.timeOfScan=new Date(data.timeOfScan);
        // Filter unnecessary data from API
        var networkJSON = data.data.networks.filter((n:any)=>!(n.BSSID==="BSSID"||n.BSSID===""||n.BSSID==="Station MAC"));
        // Clear networks-data
        this.networks=[];
        // Push new data into networks-array
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
        // Remove networks with invalid data
        this.networks=this.networks.filter((n:Network)=>!(n.authentication===undefined||n.beacons===NaN||n.essid===undefined||n.ip===NaN||n.iv===NaN||n.power===NaN));
      }
    );
  }

}
