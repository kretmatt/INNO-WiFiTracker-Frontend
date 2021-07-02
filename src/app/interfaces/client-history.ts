// Import statements
import { Client } from "./client";

export interface ClientHistory {
    // Client GUID / MAC 
    key:string;
    // Collected client data
    value:Client[];
    // Color of the client
    color?:string;
}
