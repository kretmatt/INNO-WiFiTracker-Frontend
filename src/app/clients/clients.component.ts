import { Component, OnInit } from '@angular/core';
import { MatTab } from '@angular/material/tabs';
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
  g:any;
  tooltip:any;
  margin:number=50;
  width:number=750;
  height:number=400;

  constructor(private clientService: ClientsService) { }

  ngOnInit(): void {
    this.receiveData();
    this.createSVG();
    this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }

  calculateDistance(powerLevel:number, frequency:number){
    var exponent = (27.55-(20*Math.log10(frequency))+Math.abs(powerLevel))/20;
    return Math.pow(10,exponent);
  }

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
            distance24:this.calculateDistance(+c.power,2400),
            distance5:this.calculateDistance(+c.power,5000)
          });
        });
        this.drawDistances(this.clients);
      }
    );
  }

  createSVG():void{
    this.svg = d3.select("figure#distance")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
    this.tooltip = d3.select("#tooltip")	
      .style("opacity", 0);
  }

  drawDistances(data:Client[]):void{
    data.sort((a:Client,b:Client)=>b.distance24-a.distance24);
    var circles=this.svg.selectAll("circle").data(data, function(c:Client){return c.MAC;});
    var tt = this.tooltip;
    //fade out existing circles and remove previous data
    circles.exit().transition("time")
    .duration(500)
    .attr("r", 0)
    .attr("stroke-opacity",0)
    .remove();
    
    //fade in new circles bound to data
    circles.enter().append("circle")
    .attr("cx", (this.width+this.margin*2)/2)
    .attr("cy",(this.height+this.margin*2)/2)
    .attr("r", 0)
    .attr('stroke', function(){
      return environment.bluepalette[Math.floor(Math.random()*environment.bluepalette.length)]
    })
    .attr('stroke-width',2)
    .attr('fill','transparent')
    .attr("stroke-opacity",0)
    .on("mousemove", function(e:any,c:Client){
      tt.style('transform', `translate(${e.layerX}px, ${e.layerY-635}px)`)
      .style('opacity', 1).style('background-color','#3f51b5').html(c.MAC+"<br>"+c.distance24+" m")
    })
    .on("mouseout",function(e:any){
      tt.style('opacity',0);
    })
    .merge(circles).transition("time")
      .duration(500)
      .attr("r", (d:Client)=>(d.distance24*2+(Math.random()*10)))
      .attr("stroke-opacity",1);


  }
}
