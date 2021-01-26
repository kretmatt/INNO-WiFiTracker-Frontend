export interface Network {
    BSSID:string;
    firstTimeSeen: string;
    lastTimeSeen: string;
    speed:number;
    channel:number;
    privacy:string;
    cipher:string;
    authentication:string;
    power:number;
    beacons:number;
    iv:number;
    ip:number;
    essid:string;
}
