import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Client } from '../interfaces/client';
import { ClientsService } from '../services/clients.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  timeOfScan:Date=new Date();
  clients:Client[]=[];
  subscription:Subscription=new Subscription();
  svg:any;
  tooltip:any;
  margin:number=50;
  width:number=750;
  height:number=400;

  constructor(private clientService: ClientsService) { }

  ngOnInit(): void {
    this.initDiagram();
    this.receiveData();
    this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }
  /*
  calculateDistance(powerLevel:number, frequency:number){
    var exponent = (27.55-(20*Math.log10(frequency))+Math.abs(powerLevel))/20;
    return Math.pow(10,exponent);
  }
  */
  receiveData(){
    this.clientService.getClients().subscribe(
      (data:any)=>{
        this.timeOfScan=new Date(data.timeOfScan);
        var clientJSON = data.data.clients.filter((c:any)=>!(c.MAC==="BSSID"||c.MAC===""||c.MAC==="Station MAC"));
        this.clients=[];
        clientJSON.forEach((c:any) => {
          this.clients.push({
            MAC:c.MAC,
            power:+c.power,
            firstTimeSeen:c.firstTimeSeen,
            lastTimeSeen:c.lastTimeSeen,
            packets:+c.packets,
            BSSID:c.BSSID,
            probes:c.probes,
            distance24:c.distance_2_4ghz,
            distance5:c.distance_5ghz
          });
        });
        this.drawDistances(this.clients);
      }
    );
  }

  initDiagram():void{
    //Initialise the svg element inside the fiure tag with the id distance
    this.svg = d3.select("figure#distance")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 960 500")
      .append("g");
    //Enable zoom functionality
    var svgcontainer = this.svg;
    svgcontainer.call(d3.zoom().on('zoom',function(e:any){
      svgcontainer.attr("transform",e.transform)
    }));
    //Initially set tooltip opacity to 0
    this.tooltip = d3.select("#tooltip")	
      .style("opacity", 0);
  }

  drawDistances(data:Client[]):void{
    //Sort clients by distance (descending)
    data.sort((a:Client,b:Client)=>b.distance24-a.distance24);
    //Create new variable called circles. It is a selection of all circle elements inside the svg. Set data context to the new client-dataset from the server 
    var circles=this.svg.selectAll("circle").data(data, function(c:Client){return c.MAC;});
    //Create variable which references the tooltip instance of the component. Is needed for events such as mousemove and mouseout (context changes and therefore this.tooltip cannot be used)
    var tt = this.tooltip;
    var margin = this.margin;
    //Create new circles
    circles.enter().append("circle")
    .attr("cx", (this.width+2*this.margin)/2)
    .attr("cy",(this.height+2*this.margin)/2)
    .attr("r", 0)
    .attr('stroke', function(){
      return environment.palette[Math.floor(Math.random()*environment.palette.length)]
    })
    .attr('stroke-width',2)
    .attr('fill','transparent')
    .attr("stroke-opacity",0)
    .on("mousemove", function(e:any,c:Client){
      //Increase stroke width and show tooltip
      d3.select(e.originalTarget).style('stroke-width',4);
      tt.style('transform', `translate(${e.layerX}px, ${(e.layerY-2*margin)}px)`)
      .style('opacity', 1).style('background-color','#3f51b5').html(c.MAC+"<br>"+c.distance24+" m")
    })
    //Update radius of circles and fade in new rings
    .on("mouseout",function(e:any){
      //Decrease stroke width and hide tooltip
      d3.select(e.originalTarget).style('stroke-width',2);
      tt.style('opacity',0);
    })
    //
    .merge(circles).transition("time")
      .duration(500)
      .attr("r", (d:Client)=>(d.distance24*2))
      .attr("stroke-opacity",1);
    

    circles.sort((a:Client,b:Client)=>b.distance24-a.distance24);

    //fade out existing circles and remove previous data
      circles.exit().transition("time")
      .duration(500)
      .attr("r", 0)
      .attr("stroke-opacity",0)
      .remove();
      
  }
}
