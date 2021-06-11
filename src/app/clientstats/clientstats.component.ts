import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-clientstats',
  templateUrl: './clientstats.component.html',
  styleUrls: ['./clientstats.component.scss']
})
export class ClientstatsComponent implements OnInit {
  @Input() clientHistory: any;
  maxCols:number=5;
  breakWidth:number=1500;
  break:boolean=false;

  distanceHistoryDiagram:any;
  averageSpeedHistoryDiagram:any;
  ringsDiagram:any;

  constructor() { }

  ngOnInit(): void {
    if(window.innerWidth<this.breakWidth)
      this.break=true;
  }

  onResize(event:any){
    if(event.target.innerWidth<this.breakWidth)
      this.break=true;
    else
      this.break=false;
  }

  cols(expectedCols:number){
    if(this.break)
      return this.maxCols;
    return expectedCols;
  }

  rows(expectedRows:number){
    if(this.break)
      return 1;
    return expectedRows;
  }

  drawDistanceHistoryDiagram(){

  }

  drawAverageSpeedHistoryDiagram(){

  }

  drawRingsDiagram(){
    
  }
}
