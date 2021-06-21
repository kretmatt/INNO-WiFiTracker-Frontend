import { Client } from "./client";

export interface ClientHistory {
    key:string;
    value:Client[];
    color?:string;
}
