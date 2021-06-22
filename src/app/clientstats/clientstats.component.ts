import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ClientHistory } from '../interfaces/client-history';
import{Client} from '../interfaces/client';
import { Numeric } from 'd3-array';
import * as d3 from 'd3';
import { axisRight, axisTop } from 'd3';
import { max } from 'rxjs/operators';
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
  packetCount:number=0;
  averagePower:number=0;

  //Ring svg elements
  xRing:any;
  ringXAxis:any;
  ringSVG:any;
  circle:any;

  ///Distancehistory svg elements
  xDistanceHistory:any;
  yDistanceHistory:any;
  xAxisDistanceHistory:any;
  yAxisDistanceHistory:any;
  distanceHistorySVG:any;

  //Speed history svg elements
  xSpeedHistory:any;
  ySpeedHistory:any;
  xAxisSpeedHistory:any;
  yAxisSpeedHistory:any;
  speedHistorySVG:any;

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
    if(this.clientHistory.value.length>=2){
      this.analyzeHistory();
      this.drawRingsDiagram();
      this.drawAverageSpeedHistoryDiagram();
      this.drawDistanceHistoryDiagram();
    }else{
      this.clearDiagram();
    }
  }

  clearDiagram(){
    this.distanceHistorySVG = d3.select("figure#clientdistancehistory");
    this.distanceHistorySVG.selectAll("*").remove();
  }

  drawDistanceHistoryDiagram(){
    //Select diagram and empty it
    this.distanceHistorySVG = d3.select("figure#clientdistancehistory");
    this.distanceHistorySVG.selectAll("*").remove();
    //Get available width and height
    let width = this.distanceHistorySVG.node().getBoundingClientRect().width;
    let height = this.distanceHistorySVG.node().getBoundingClientRect().height;
    //Add svg element to figure
    this.distanceHistorySVG = this.distanceHistorySVG.append("svg")
                                                     .attr("preserveAspectRatio", "xMinYMin meet")
                                                     .attr("viewBox", "-40 20 "+width+" "+height)
                                                     .append("g");

    //select max and min values to set the appropriate domain of x and y axis
    var maxdate = this.clientHistory.value.reduce((a:Client,b:Client)=>{
      return a.timeOfScan>b.timeOfScan?a:b
    }).timeOfScan;
    var mindate = this.clientHistory.value.reduce((a:Client,b:Client)=>{
      return a.timeOfScan<b.timeOfScan?a:b
    }).timeOfScan;
    var maxdistance = this.clientHistory.value.reduce((a:Client,b:Client)=>{
      return a.distance24>b.distance24?a:b
    }).distance24;
    //Set scalers, xAxis and yAxis for diagram
    this.xDistanceHistory = d3.scaleTime().rangeRound([0,width]).domain([mindate,maxdate]);
    this.yDistanceHistory = d3.scaleLinear().domain([0, maxdistance+5]).range([height,0]);
    this.yAxisDistanceHistory = this.distanceHistorySVG.append("g").attr("transform", "translate(0,0)").call(d3.axisLeft(this.yDistanceHistory));
    this.xAxisDistanceHistory = this.distanceHistorySVG.append("g").attr("transform","translate(0,"+height+")").call(d3.axisBottom(this.xDistanceHistory));
    //Set linebuilder
    var lineBuilder = d3.line().x((d:any)=>{return this.xDistanceHistory(d[0])}).y((d:any)=>{return this.yDistanceHistory(d[1])});
    //Extract values
    var values:[number,number][] = [];
    this.clientHistory.value.forEach((c:Client)=>{
      values.push([c.timeOfScan.getTime(),c.distance24]);
    });
    //Create and draw line
    var line = this.distanceHistorySVG.append("path")
                                      .attr("class","chart-line")
                                      .style("fill","none")
                                      .style("stroke",this.clientHistory.color)
                                      .style("stroke-width","4px")
                                      .attr("d",lineBuilder(values));
                       
  }

  drawAverageSpeedHistoryDiagram(){
    //Select diagram and empty it
    this.speedHistorySVG = d3.select("figure#speedhistory");
    this.speedHistorySVG.selectAll("*").remove();
    //Get available width and height
    let width = this.speedHistorySVG.node().getBoundingClientRect().width;
    let height = this.speedHistorySVG.node().getBoundingClientRect().height;
    //Add svg element to figure
    this.speedHistorySVG = this.speedHistorySVG.append("svg")
                                                     .attr("preserveAspectRatio", "xMinYMin meet")
                                                     .attr("viewBox", "-40 20 "+width+" "+height)
                                                     .append("g");

    //select max and min values to set the appropriate domain of y axis
    var maxdate = this.clientHistory.value.reduce((a:Client,b:Client)=>{
      return a.timeOfScan>b.timeOfScan?a:b
    }).timeOfScan;
    var mindate = this.clientHistory.value.reduce((a:Client,b:Client)=>{
      return a.timeOfScan<b.timeOfScan?a:b
    }).timeOfScan;

    //Calculate speed between data points
    var linesdata:[number,number][][]=[];
    let data = this.clientHistory.value;
    data.sort((a:Client,b:Client)=>{
      return a.timeOfScan.getTime()-b.timeOfScan.getTime();
    });
    //Calculate speed between the distances
    var result = data.reduce(function(acc,element,index,array){
      acc.sum += element.distance24-acc.prev.distance24;
      var speed = (element.distance24-acc.prev.distance24)/(Math.abs(element.timeOfScan.getTime()-acc.prev.timeOfScan.getTime())/1000);
      index && isFinite(speed) && acc.array.push([[speed,acc.prev.timeOfScan.getTime()],[speed,element.timeOfScan.getTime()]]);
      acc.prev=element;
      return acc;
    },{array:linesdata,sum:0,prev:data[0]});
    //Get max and min speed
    if(result.array.length>=1){
      var maxspeed = result.array.reduce((a:[number,number][], b:[number, number][])=>{
        return a[0][0]>b[0][0]?a:b;
      })[0][0];
      var minspeed = result.array.reduce((a:[number,number][], b:[number, number][])=>{
        return a[0][0]<b[0][0]?a:b;
      })[0][0];
      //Set scalers, xAxis and yAxis for diagram
      this.xSpeedHistory = d3.scaleTime().rangeRound([0,width]).domain([mindate,maxdate]);
      this.ySpeedHistory = d3.scaleLinear().domain([-5, 5]).range([height,0]);
      this.yAxisSpeedHistory= this.speedHistorySVG.append("g").attr("transform", "translate(0,0)").call(d3.axisLeft(this.ySpeedHistory));
      this.xAxisSpeedHistory = this.speedHistorySVG.append("g").attr("transform","translate(0,"+height/2+")").call(d3.axisBottom(this.xSpeedHistory));

      //Set linebuilder
      var lineBuilder = d3.line().x((d:any)=>{return this.xSpeedHistory(d[1])}).y((d:any)=>{return this.ySpeedHistory(d[0])});
      //Create and draw line
      var lines = this.speedHistorySVG.selectAll(".chart-line").data(result.array);
      lines.enter().append("path").attr("class","chart-line").style("fill","none").style("stroke",this.clientHistory.color)
                   .style("stroke-width","4px")
                   .attr("d",(d:any)=>{
                     return lineBuilder(d);
                   });
    }
    
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
    let data = this.clientHistory.value;
    data.sort((a:Client,b:Client)=>{
      return a.timeOfScan.getTime()-b.timeOfScan.getTime();
    });
    this.circle.attr("r",0);
    data.forEach((c:Client, index:number)=>{
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
        return a.timeOfScan.getTime()-b.timeOfScan.getTime();
      });
      //Check how often the client appeared on scans
      this.scannedCount = this.clientHistory.value.length;
      //Calculate average distance to Scanning station
      this.averageDistance = data.reduce((total:number, next:Client)=>total+next.distance24,0) / data.length;
      //Calculate the packet count
      this.packetCount = data.reduce((total:number, next:Client)=>total+next.packets,0);
      //Calculate the average power
      this.averagePower = data.reduce((total:number,next:Client)=>total+Math.abs(next.power),0)/data.length;
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

      var linesdata:[number,number][][]=[];
      data.sort((a:Client,b:Client)=>{
        return a.timeOfScan.getTime()-b.timeOfScan.getTime();
      });
      //Calculate speed between the distances
      var result = data.reduce(function(acc,element,index,array){
        acc.sum += element.distance24-acc.prev.distance24;
        var speed = (element.distance24-acc.prev.distance24)/(Math.abs(element.timeOfScan.getTime()-acc.prev.timeOfScan.getTime())/1000);
        index && isFinite(speed) && acc.array.push([[speed,acc.prev.timeOfScan.getTime()],[speed,element.timeOfScan.getTime()]]);
        acc.prev=element;
        return acc;
      },{array:linesdata,sum:0,prev:data[0]});
      var helper = 0;
      result.array.forEach((ra)=>{
        helper += (ra[0][0]*((ra[1][1]-ra[0][1])/1000))
      });
      this.averageSpeed = (helper)/((latestdate.getTime()-oldestdate.getTime())/1000)

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
