// Import statements
import { Component, Input, OnInit } from '@angular/core';
import { Network } from '../interfaces/network';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {
  // Network data passed into the component
  @Input() network!:Network;

  constructor() { }

  ngOnInit(): void {
  }
}
