export interface Network {
    BSSID:string;
    // First time the network was detected in a scan
    firstTimeSeen: string;
    // Last time the network was detected in a scan
    lastTimeSeen: string;
    // Transfer speed of network
    speed:number;
    // Channel on which the network was detected
    channel:number;
    // Privacy setting of network
    privacy:string;
    // Cipher setting of network
    cipher:string;
    // Authentication protocol used by the network
    authentication:string;
    // Signal strength
    power:number;
    // Amount of beacon frames sent by the network
    beacons:number;
    // Initialization vector
    iv:number;
    // LAN IP address
    ip:number;
    // Name of the network
    essid:string;
}
