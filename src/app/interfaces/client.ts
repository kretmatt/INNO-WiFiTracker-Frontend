export interface Client {
    MAC:string;
    firstTimeSeen: string;
    lastTimeSeen: string;
    power: number;
    packets: number;
    BSSID: string;
    probes:string;
    distance24:number;
    distance5:number;
}
