import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ClientHistory } from '../interfaces/client-history';
import{Client} from '../interfaces/client';
import { Numeric } from 'd3-array';
import * as d3 from 'd3';
@Component({
  selector: 'app-clientstats',
  templateUrl: './clientstats.component.html',
  styleUrls: ['./clientstats.component.scss']
})
export class ClientstatsComponent implements OnInit, OnChanges {
  @Input() public clientHistory: ClientHistory;
  maxCols:number=5;
  breakWidth:number=1500;
  break:boolean=false;

  distanceHistoryDiagram:any;
  averageSpeedHistoryDiagram:any;
  ringsDiagram:any;

  //Client stats properties
  coveredDistance:number=0;
  averageSpeed:number=0;
  averageDistance:number=0;
  distanceDeviation:number=0;
  scannedCount:number=0;
  overallTrend:string="";

  //Ring svg elements
  xRing:any;
  ringXAxis:any;
  ringSVG:any;
  circle:any;

  constructor() { 
    this.clientHistory = {
      key:"",
      value:[],
      color:"#FFF"
    };
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.assembleStats();
  }

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

  assembleStats(){
    this.analyzeHistory();
    this.drawAverageSpeedHistoryDiagram();
    this.drawDistanceHistoryDiagram();
    this.drawRingsDiagram();
  }

  drawDistanceHistoryDiagram(){
    console.log("todo");
  }

  drawAverageSpeedHistoryDiagram(){
    console.log("todo");
  }

  drawRingsDiagram(){
    //Initialise the svg element inside the figure tag with the id distancerings
    this.ringSVG = d3.select("figure#distancerings");
    this.ringSVG.selectAll("*").remove();
    let width = this.ringSVG.node().getBoundingClientRect().width;
    let height = this.ringSVG.node().getBoundingClientRect().height;
    this.ringSVG = this.ringSVG.append("svg")
                               .attr("preserveAspectRatio","xMinYMin meet")
                               .attr("viewBox","0 0 "+width+" "+height)
                               .append("g");
    //Get max value for scaling
    var maxdistance = this.clientHistory.value.reduce((a:Client,b:Client)=>{
      return a.distance24>b.distance24?a:b
    }).distance24;
    //Create axis and scaler
    this.xRing = d3.scaleLinear().domain([0,maxdistance]).range([0,(height/2)-10]);
    this.ringXAxis = this.ringSVG.append("g").attr("transform","translate("+width/2+","+height/2+")").call(d3.axisBottom(this.xRing));
    //Create circle
    this.circle = this.ringSVG.append("circle")
                             .attr("cx",width/2)
                             .attr("cy",height/2)
                             .attr("r",0)
                             .attr('stroke', this.clientHistory.color)
                             .attr('stroke-width',2)
                             .attr('fill','transparent');
    //Pipe animation of circle
    this.animateRing();
  }

  animateRing(){
    this.circle.attr("r",0);
    this.clientHistory.value.forEach((c:Client, index:number)=>{
      this.circle.transition()
            .delay(1500*index)
            .ease(d3.easeSin)
            .duration(1000)
            .attr("r",this.xRing(c.distance24));
    });
    
  }

  analyzeHistory(){
    this.coveredDistance=0;
    let data = this.clientHistory.value;
    if(data.length<2){
      this.coveredDistance=0;
      this.averageSpeed=0;
      this.averageDistance=0;
      this.distanceDeviation=0;
      this.scannedCount=0;
      this.overallTrend="";
    }else{
      data.sort((a:Client,b:Client)=>{
        return b.timeOfScan.getTime()-a.timeOfScan.getTime();
      });
      //Check how often the client appeared on scans
      this.scannedCount = this.clientHistory.value.length;
      //Calculate average distance to Scanning station
      this.averageDistance = data.reduce((total:number, next:Client)=>total+next.distance24,0) / data.length;
      //Calculate average speed and distance deviation
      var latestdate = data.reduce((a:Client,b:Client)=>{
        return a.timeOfScan>b.timeOfScan?a:b
      }).timeOfScan;
      var oldestdate = data.reduce((a:Client,b:Client)=>{
        return a.timeOfScan<b.timeOfScan?a:b
      }).timeOfScan;
      var latestDistance = data.reduce((a:Client,b:Client)=>{
        return a.timeOfScan>b.timeOfScan?a:b
      }).distance24;
      var oldestDistance = data.reduce((a:Client,b:Client)=>{
        return a.timeOfScan<b.timeOfScan?a:b
      }).distance24;
      this.distanceDeviation = Math.abs(latestDistance-oldestDistance);
      this.averageSpeed = (latestDistance+oldestDistance)/((latestdate.getTime()-oldestdate.getTime())/1000)
      //Iterate over the the client history to find covered distance, 
      let currentDistance=0;
      let currCovDistance;
      this.clientHistory.value.forEach((c:Client, index:number)=>{
        if (index!=0) {
          this.coveredDistance =this.coveredDistance+Math.abs(currentDistance-c.distance24);
          currentDistance=c.distance24;
        }else{
          currentDistance=c.distance24;
        }
      });
    }
    
  }
}
