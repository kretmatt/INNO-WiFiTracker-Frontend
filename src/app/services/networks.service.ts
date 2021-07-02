// Import statements
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NetworksService {

  // Inject HttpClient instance in constructor
  constructor(private http: HttpClient) { }

  // Method for requesting network data from API
  getNetworks(){
    return this.http.get(environment.apiURL+"/data/networks");
  }
}
