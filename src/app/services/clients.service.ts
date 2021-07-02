// Import statements
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  
  // Inject HttpClient instance in the constructor
  constructor(private http: HttpClient) { }

  // Method for retrieving client-data from API
  getClients(){
    return this.http.get(environment.apiURL+'/data/clients');
  }
}
