import { Component, OnInit } from '@angular/core';
import { Client } from '../interfaces/client';
import { ClientsService } from '../services/clients.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  clients:Client[]=[];
  constructor(private clientService: ClientsService) { }

  ngOnInit(): void {
    
  }

}
