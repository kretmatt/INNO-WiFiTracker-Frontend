import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Client } from '../interfaces/client';
@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  constructor(private http: HttpClient) { }
  getClients(){
    return this.http.get('https://wifipersontracker.herokuapp.com/test/clients');
  }
}
