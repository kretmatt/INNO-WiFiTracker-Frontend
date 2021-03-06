// Import statements
import { Component, Input, OnInit } from '@angular/core';
import { Client } from '../interfaces/client';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  // Client data passed into the component
  @Input() client!:Client;
  
  constructor() {}

  ngOnInit(): void {
  }

}
