export interface Client {
    // MAC-address or GUID
    MAC:string;
    // First time the client was detected in a scan
    firstTimeSeen: string;
    // Last time the client was detected in a scan
    lastTimeSeen: string;
    // Signal strength
    power: number;
    // Amount of packages sent by the client
    packets: number;
    // MAC-Address of the network the client is connected to
    BSSID: string;
    // The network the client is trying to connect to
    probes:string;
    // Distance of the client to a sensor / Raspberry PI (calculated with 2.4 Ghz)
    distance24:number; 
    // Distance of the client to a sensor / Raspberry PI (calculated with 5 Ghz)
    distance5:number;
    // Time / Date of the scan
    timeOfScan:Date;
}
