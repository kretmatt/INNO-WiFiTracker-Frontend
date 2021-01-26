import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class NetworksService {

  constructor(private http: HttpClient) { }
  getNetworks(){
    return this.http.get(environment.apiURL+"/data/networks");
  }
}
