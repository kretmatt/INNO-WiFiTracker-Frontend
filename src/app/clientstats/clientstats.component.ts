// Import statements
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ClientHistory } from '../interfaces/client-history';
import{ Client } from '../interfaces/client';
import * as d3 from 'd3';

@Component({
  selector: 'app-clientstats',
  templateUrl: './clientstats.component.html',
  styleUrls: ['./clientstats.component.scss']
})
export class ClientstatsComponent implements OnInit, OnChanges {
  
  // Input from clients-component
  @Input() public clientHistory: ClientHistory;
  
  // Properties for responsiveness
  maxCols:number=5;
  breakWidth:number=1500;
  break:boolean=false;
  
  // Padding used for svg elements
  padding:number=50;

  //Client stats properties
  coveredDistance:number=0;
  averageSpeed:number=0;
  averageDistance:number=0;
  distanceDeviation:number=0;
  scannedCount:number=0;
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

  // Set default value of selected clientHistory in constructor
  constructor() { 
    this.clientHistory = {
      key:"",
      value:[],
      color:"#FFF"
    };
  }

  // If Input-Variables ( in this case the clientHistory property ) change, execute the method 
  ngOnChanges(changes: SimpleChanges): void {
    this.assembleStats();
  }

  // Angular lifecyle hook, which gets executed during the initialization process of the component
  ngOnInit(): void {
    // Determine whether or not the content needs to be split into separate rows
    if(window.innerWidth<this.breakWidth)
      this.break=true;
  }

  // onResize determines whether or not the content needs to be split into separate rows. Gets called every time the window is resized
  onResize(event:any){
    if(event.target.innerWidth<this.breakWidth)
      this.break=true;
    else
      this.break=false;
  }

  // cols returns the amount of columns, the mat-grid-tile element is allowed to occupy. If break is true (because window size is too small), a mat-grid-tile occupies all columns.
  cols(expectedCols:number){
    if(this.break)
      return this.maxCols;
    return expectedCols;
  }

  // rows returns the amount of columns, the mat-grid-tile element is allowed to occupy. If break is true, a mat-grid-tile will only occupy one row.
  rows(expectedRows:number){
    if(this.break)
      return 1;
    return expectedRows;
  }

  // Generate all diagrams and analyze clientHistory if there are at least 2 measurements
  assembleStats(){
    this.analyzeHistory();
    if(this.clientHistory.value.length>=2){
      this.drawRingsDiagram();
      this.drawAverageSpeedHistoryDiagram();
      this.drawDistanceHistoryDiagram();
    }else{
      this.clearDiagram();
    }
  }

  clearDiagram(){
    // Remove old elements from diagrams
    this.distanceHistorySVG = d3.select("figure#clientdistancehistory");
    this.distanceHistorySVG.selectAll("*").remove();
    this.speedHistorySVG = d3.select("figure#speedhistory");
    this.speedHistorySVG.selectAll("*").remove();
    this.ringSVG = d3.select("figure#distancerings");
    this.ringSVG.selectAll("*").remove();
  }
  // Method for generating Distance history diagram
  drawDistanceHistoryDiagram(){
    //Select diagram and remove old elements
    this.distanceHistorySVG = d3.select("figure#clientdistancehistory");
    this.distanceHistorySVG.selectAll("*").remove();
    //Get available width and height
    let width = this.distanceHistorySVG.node().getBoundingClientRect().width;
    let height = this.distanceHistorySVG.node().getBoundingClientRect().height;
    //Add svg element to figure
    this.distanceHistorySVG = this.distanceHistorySVG.append("svg")
                                                     .attr("preserveAspectRatio", "xMinYMin meet")
                                                     .attr("viewBox", `-${this.padding} ${this.padding} ${width} ${height}`)
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
    this.xDistanceHistory = d3.scaleTime().rangeRound([0,width-this.padding]).domain([mindate,maxdate]);
    this.yDistanceHistory = d3.scaleLinear().domain([0, maxdistance+5]).range([height-this.padding,0]);
    this.yAxisDistanceHistory = this.distanceHistorySVG.append("g").attr("transform", `translate(0,${this.padding})`).call(d3.axisLeft(this.yDistanceHistory));
    this.xAxisDistanceHistory = this.distanceHistorySVG.append("g").attr("transform","translate(0,"+height+")").call(d3.axisBottom(this.xDistanceHistory));
    // Add x-Axis label
    this.distanceHistorySVG.append("text")
        .attr("text-anchor","end")
        .attr("x",width-this.padding)
        .attr("y",height+((this.padding/2)+10))
        .text("Time of the day");
    // Add y-Axis label
    this.distanceHistorySVG.append("text")
        .attr("text-anchor","end")
        .attr("x",-this.padding)
        .attr("y",-this.padding+10)
        .attr("transform","rotate(-90)")
        .text("Distance in meters");
    //Set linebuilder with according scalers
    var lineBuilder = d3.line().x((d:any)=>{return this.xDistanceHistory(d[0])}).y((d:any)=>{return this.yDistanceHistory(d[1])});
    //Extract values and put them into appropriate format for linebuilder / line generator
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
                                      .attr("d",lineBuilder(values))
                                      .attr("transform",`translate(0,${this.padding})`);
  }

  // Method for generating AverageSpeedHistory Diagram
  drawAverageSpeedHistoryDiagram(){
    //Select diagram and remove old elements
    this.speedHistorySVG = d3.select("figure#speedhistory");
    this.speedHistorySVG.selectAll("*").remove();
    //Get available width and height
    let width = this.speedHistorySVG.node().getBoundingClientRect().width;
    let height = this.speedHistorySVG.node().getBoundingClientRect().height;
    //Add svg element to figure
    this.speedHistorySVG = this.speedHistorySVG.append("svg")
                                                     .attr("preserveAspectRatio", "xMinYMin meet")
                                                     .attr("viewBox", `-${this.padding} ${this.padding} ${width} ${height}`)
                                                     .append("g");    
    // Prepare variables for calculating speed between data points
    var linesdata:[number,number][][]=[];
    let data = this.clientHistory.value;
    // Sort data by timeOfScan (oldest-latest)
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
    // Only draw if there is at least one speed value
    if(result.array.length>=1){
      //Get max and min speed for scalers and 
      var maxspeed = result.array.reduce((a:[number,number][], b:[number, number][])=>{
        return a[0][0]>b[0][0]?a:b;
      })[0][0];
      var minspeed = result.array.reduce((a:[number,number][], b:[number, number][])=>{
        return a[0][0]<b[0][0]?a:b;
      })[0][0];
      //select max and min values to set the appropriate domain of y axis
      var maxdate = this.clientHistory.value.reduce((a:Client,b:Client)=>{
        return a.timeOfScan>b.timeOfScan?a:b
      }).timeOfScan;
      var mindate = this.clientHistory.value.reduce((a:Client,b:Client)=>{
        return a.timeOfScan<b.timeOfScan?a:b
      }).timeOfScan;
      //Set scalers, xAxis and yAxis for diagram
      this.xSpeedHistory = d3.scaleTime().rangeRound([0,width-this.padding]).domain([mindate,maxdate]);
      this.ySpeedHistory = d3.scaleLinear().domain([-6, 6]).range([height-this.padding,0]);
      this.yAxisSpeedHistory= this.speedHistorySVG.append("g").attr("transform", `translate(0,${this.padding+5})`).call(d3.axisLeft(this.ySpeedHistory));
      this.xAxisSpeedHistory = this.speedHistorySVG.append("g").attr("transform","translate(0,"+((height/2)+(this.padding/2)+5)+")").call(d3.axisBottom(this.xSpeedHistory));
      // Add x-Axis label
      this.speedHistorySVG.append("text")
              .attr("text-anchor","end")
              .attr("x",width-this.padding)
              .attr("y",height+((this.padding/2)+10))
              .text("Time of the day");
      // Add y-Axis label
      this.speedHistorySVG.append("text")
              .attr("text-anchor","end")
              .attr("x",-this.padding)
              .attr("y",-this.padding+10)
              .attr("transform","rotate(-90)")
              .text("Speed in meters per second");
      //Set linebuilder with the appropriate scalers
      var lineBuilder = d3.line().x((d:any)=>{return this.xSpeedHistory(d[1])}).y((d:any)=>{return this.ySpeedHistory(d[0])});
      //Create and draw line
      var lines = this.speedHistorySVG.selectAll(".chart-line").data(result.array);
      lines.enter().append("path").attr("class","chart-line").style("fill","none").style("stroke",this.clientHistory.color)
                   .style("stroke-width","4px")
                   .attr("d",(d:any)=>{
                     return lineBuilder(d);
                   })
                   .attr("transform",`translate(0,${this.padding+5})`);
    }
    
  }

  // Method for generating the ring diagram
  drawRingsDiagram(){
    // Initialise the svg element inside the figure tag with the id distancerings
    this.ringSVG = d3.select("figure#distancerings");
    // Remove old elements
    this.ringSVG.selectAll("*").remove();
    // Get available space for the diagram
    let width = this.ringSVG.node().getBoundingClientRect().width;
    let height = this.ringSVG.node().getBoundingClientRect().height;
    // Create the svg element and set viewBox attribute
    this.ringSVG = this.ringSVG.append("svg")
                               .attr("preserveAspectRatio","xMinYMin meet")
                               .attr("viewBox","0 0 "+width+" "+height)
                               .append("g");
    // Get max value for scaling
    var maxdistance = this.clientHistory.value.reduce((a:Client,b:Client)=>{
      return a.distance24>b.distance24?a:b
    }).distance24;
    // Create axis and scaler
    this.xRing = d3.scaleLinear().domain([0,maxdistance]).range([0,(height/2)-10]);
    this.ringXAxis = this.ringSVG.append("g").attr("transform","translate("+width/2+","+height/2+")").call(d3.axisBottom(this.xRing));
    // Create circle element (hide it at first)
    this.circle = this.ringSVG.append("circle")
                             .attr("cx",width/2)
                             .attr("cy",height/2)
                             .attr("r",0)
                             .attr('stroke', this.clientHistory.color)
                             .attr('stroke-width',2)
                             .attr('fill','transparent');
    // Execute animation of the ring diagram
    this.animateRing();
  }

  // Execute the animation between the several distance values of clientHistory in the ring-diagram
  animateRing(){
    let data = this.clientHistory.value;
    // Sort data by timeOfScan (oldest-latest)
    data.sort((a:Client,b:Client)=>{
      return a.timeOfScan.getTime()-b.timeOfScan.getTime();
    });
    // Set radius of circle to 0
    this.circle.attr("r",0);
    // Queue an animation for every measurement in clientHistory. Every animation is delayed by a multiple of 1.5 seconds to avoid that every animation gets executed at once
    data.forEach((c:Client, index:number)=>{
      this.circle.transition()
            .delay(1500*index)
            .ease(d3.easeSin)
            .duration(1000)
            .attr("r",this.xRing(c.distance24));
    });
  }


  // Calculate different pieces of information from clientHistory
  analyzeHistory(){
    let data = this.clientHistory.value;
    if(data.length<2){
      //Reset values to 0
      this.coveredDistance=0;
      this.averageSpeed=0;
      this.averageDistance=0;
      this.distanceDeviation=0;
      this.scannedCount=0;
      this.packetCount=0;
      this.averagePower=0;
    }else{
      // Sort measured data by timeOfScan (oldest-latest)
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
      // Get oldest and latest date / distance
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
      // Calculate distance deviation from start to finish
      this.distanceDeviation = Math.abs(latestDistance-oldestDistance);
      // Prepare array for calculation of average speed
      var linesdata:[number,number][][]=[];
      //Calculate speed between the data measurements
      var result = data.reduce(function(acc,element,index,array){
        acc.sum += element.distance24-acc.prev.distance24;
        var speed = (element.distance24-acc.prev.distance24)/(Math.abs(element.timeOfScan.getTime()-acc.prev.timeOfScan.getTime())/1000);
        index && isFinite(speed) && acc.array.push([[speed,acc.prev.timeOfScan.getTime()],[speed,element.timeOfScan.getTime()]]);
        acc.prev=element;
        return acc;
      },{array:linesdata,sum:0,prev:data[0]});
      // Calculate average speed
      var helper = 0;
      result.array.forEach((ra)=>{
        // ra[0][0] = speed, ra[1][1] = time of second measurement, ra[0][1] = time of first measurement | Calculate speed * time between first and second measurement and add it to helper variable
        helper += (ra[0][0]*((ra[1][1]-ra[0][1])/1000))
      });
      // Divide helper (sum of every calculated speed*time between measurements) by entire time period
      this.averageSpeed = (helper)/((latestdate.getTime()-oldestdate.getTime())/1000)
      //Iterate over the the client history to calculate the covered distance 
      this.coveredDistance=0;
      let currentDistance=0;
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
