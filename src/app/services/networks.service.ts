import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class NetworksService {

  constructor(private http: HttpClient) { }
  getNetworks(){
    return this.http.get("https://wifipersontracker.herokuapp.com/test/networks");
  }
}
