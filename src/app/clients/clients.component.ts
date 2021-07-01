import { AfterContentInit, Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Client } from '../interfaces/client';
import { ClientsService } from '../services/clients.service';
import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';
import { ModalService } from '../services/modal.service';
import { ClientHistory } from '../interfaces/client-history';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements AfterContentInit {
  timeOfScan:Date=new Date();
  clients:Client[]=[];
  clientHistory:Client[]=[];
  diagramColors:string[][]=[];
  subscription:Subscription=new Subscription();
  svg:any;
  msvg:any;
  x:any;
  y:any;
  x2:any;
  xAxis:any;
  x2Axis:any;
  yAxis:any;
  tooltip:any;
  margin:number=50;
  width:number=750-this.margin;
  height:number=400-this.margin;
  lastScan:Date = new Date();
  clientHistoryGroupedByMac: [] = [];
  selectedClients: string[]=[];
  selectedClientHistory:ClientHistory;
  colorMap:Map<string,string>=new Map<string,string>();

  constructor(private clientService: ClientsService, private modalService:ModalService) {
    this.selectedClientHistory = {
      key:"",
      value:[],
      color:"#FFF"
    };
   }

  ngAfterContentInit(): void {
    setTimeout(()=>{
      var w = document.getElementById("diagrams")?.clientWidth;
      if(w!=null){
        this.width = w;
      }
      this.initDiagram();
      this.initMultiLineDiagram();
      this.receiveData();
      this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
    },500);
    
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }

  receiveData(){
    this.clientService.getClients().subscribe(
      (data:any)=>{
        this.timeOfScan=new Date(data.timeOfScan);
        if(this.timeOfScan.getTime()!==this.lastScan.getTime()){
          this.lastScan = this.timeOfScan;
          var clientJSON = data.data.clients.filter((c:any)=>!(c.MAC==="BSSID"||c.MAC===""||c.MAC==="Station MAC"));
          this.clients=[];
          clientJSON.forEach((c:any) => {
            if(this.clients.find((c2:Client)=>c2.MAC===c.MAC && c2.timeOfScan===this.timeOfScan)===undefined){
              //Add client data to current client array
              this.clients.push({
                MAC:c.MAC,
                power:+c.power,
                firstTimeSeen:c.firstTimeSeen,
                lastTimeSeen:c.lastTimeSeen,
                packets:+c.packets,
                BSSID:c.BSSID,
                probes:c.probes,
                distance24:c.distance_2_4ghz+Math.random()*10,
                distance5:c.distance_5ghz,
                timeOfScan:new Date(data.timeOfScan)
              });
            }
            if(this.clientHistory.find((c2:Client)=>c2.MAC===c.MAC && c2.timeOfScan===this.timeOfScan)===undefined){
              //Add client data to clienthistory array
              this.clientHistory.push({
                MAC:c.MAC,
                power:+c.power,
                firstTimeSeen:c.firstTimeSeen,
                lastTimeSeen:c.lastTimeSeen,
                packets:+c.packets,
                BSSID:c.BSSID,
                probes:c.probes,
                distance24:c.distance_2_4ghz+Math.random()*10,
                distance5:c.distance_5ghz,
                timeOfScan:new Date(data.timeOfScan)
              });
            }
          });
          //Generate ring distance diagram
          this.drawDistances(this.clients);
          //Remove old data
          this.clientHistory=this.clientHistory.filter(c=>c.timeOfScan.getTime()>new Date(Date.now()-environment.sortOutTime).getTime());
          //Generate multi line diagram
          this.drawDistanceHistory(this.clientHistory);
          //Group data for
          this.clientHistoryGroupedByMac = this.groupByType(this.clientHistory);
        }
      }
    );
  }

  initDiagram():void{
    //Initialise the svg element inside the figure tag with the id distance
    this.svg = d3.select("figure#distance")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 "+this.width+" "+this.width)
      .append("g");
    //Initialize scaler for axis
    this.x2 = d3.scaleLinear().domain([0,50]).range([0,(this.width/2)-10]);
    //Create and place axis inside svg element
    this.x2Axis = this.svg.append("g").attr("transform","translate("+this.width/2+","+this.width/2+")").call(d3.axisBottom(this.x2));
    //Enable zoom functionality
    var svgcontainer = this.svg;
    svgcontainer.call(d3.zoom().on('zoom',function(e:any){
      svgcontainer.attr("transform",e.transform)
    }));
    //Initially set tooltip opacity to 0
    this.tooltip = d3.select("#tooltip")	
      .style("opacity", 0);
  }

  initMultiLineDiagram():void{
    // Create svg element
    this.msvg=d3.select("figure#distancehistory")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `-${this.margin} ${this.margin} ${this.width} ${this.height}`)
      .append("g");
    //Initialize scalers for axes
    this.x = d3.scaleTime().rangeRound([0, this.width-this.margin]).domain([new Date(),new Date()]);
    this.y = d3.scaleLinear().domain([0,100]).range([this.height-this.margin,0]);
    //Initialize and place axes inside svg element
    this.yAxis=this.msvg.append("g").attr("transform", `translate(0,${this.margin})`).call(d3.axisLeft(this.y));
    this.xAxis=this.msvg.append("g").attr("transform", "translate(0," + this.height + ")").call(d3.axisBottom(this.x));
    // Add x-Axis label
    this.msvg.append("text")
             .attr("text-anchor","end")
             .attr("x",this.width-this.margin)
             .attr("y",this.height+((this.margin/2)+10))
             .text("Time of the day");
    // Add y-Axis label
    this.msvg.append("text")
             .attr("text-anchor","end")
             .attr("x",-this.margin)
             .attr("y",-this.margin+10)
             .attr("transform","rotate(-90)")
             .text("Distance in meters");
  }

  drawDistanceHistory(data:Client[]):void{
    
    //group client data by MAC/GUID
    var groupedClientData = d3Collection.nest().key(function(c:any){return c.MAC;}).entries(data); 
    //select max and min values to set the appropriate domain of x and y axis
    var maxdate = data.reduce((a:Client,b:Client)=>{
      return a.timeOfScan>b.timeOfScan?a:b
    }).timeOfScan;
    var mindate = data.reduce((a:Client,b:Client)=>{
      return a.timeOfScan<b.timeOfScan?a:b
    }).timeOfScan;
    var maxdistance = data.reduce((a:Client,b:Client)=>{
      return a.distance24>b.distance24?a:b
    }).distance24;

    //set domain of x and y axis and animate transition to new axis
    this.x.domain([mindate,maxdate]);
    this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x));
    this.y.domain([0, maxdistance+5]);
    this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));

    //create a line builder and select all lines
    var lineBuilder = d3.line().x((d:any)=>{return this.x(d.timeOfScan)}).y((d:any)=>{return this.y(d.distance24)});
    var lines = this.msvg.selectAll(".chart-line").data(groupedClientData);
        //remove obsolete data
        lines.exit().remove();    
    //set colors of new entries in the diagram
    lines.attr("stroke",(c:any)=>{
      return this.diagramColor(c.key);
    }).enter().append("path").attr("class","chart-line").attr("fill","none")
    .attr("stroke-width","4px")
    .attr("transform",`translate(0,${this.margin})`);
    //build lines in diagram
    lines.attr("d",(d:any)=>{
      return lineBuilder(d.values);
    }).on("mousemove", (e:any,c:any)=>{
      //Increase stroke width and show tooltip
      d3.select(e.originalTarget).style('stroke-width',6);
      this.tooltip.style('transform', `translate(${e.layerX}px, ${(e.layerY-2*this.margin)}px)`)
      .style('opacity', 1).style('background-color','#3f51b5').html(c.key)
    })
    .on("mouseout",(e:any)=>{
      //Decrease stroke width and hide tooltip
      d3.select(e.originalTarget).style('stroke-width',4);
      this.tooltip.style('opacity',0);
    }).
    on("click", (e:any, c:any)=>{
      if(this.selectedClients.indexOf(c.key)===-1)
      {
        this.selectedClients.push(c.key);
      }else{
        let index = this.selectedClients.indexOf(c.key);
        this.selectedClients.splice(index,1);
      }
    });

    //animate lines with dasharray
    lines._groups[0].forEach((e:any) => {
      d3.select(e).attr("stroke-dasharray", e.getTotalLength() + " " + e.getTotalLength()) 
      .attr("stroke-dashoffset", e.getTotalLength())
      .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    });

  }

  drawDistances(data:Client[]):void{
    //Sort clients by distance (descending)
    data.sort((a:Client,b:Client)=>b.distance24-a.distance24);
    //Create new variable called circles. It is a selection of all circle elements inside the svg. Set data context to the new client-dataset from the server 
    var circles=this.svg.selectAll("circle").data(data, function(c:Client){return c.MAC;});
    //Create variable which references the tooltip instance of the component. Is needed for events such as mousemove and mouseout (context changes and therefore this.tooltip cannot be used)
    var tt = this.tooltip;
    var margin = this.margin;

    var maxdistance = data.reduce((a:Client,b:Client)=>{
      return a.distance24>b.distance24?a:b
    }).distance24;

    this.x2.domain([0,maxdistance]);
    this.x2Axis.transition().duration(1000).call(d3.axisBottom(this.x2));

    //Create new circles
    circles.enter().append("circle")
    .attr("cx", (this.width)/2)
    .attr("cy",(this.width)/2)
    .attr("r", 0)
    .attr('stroke', (c:Client)=>{
      return this.diagramColor(c.MAC);
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
    }).
    on("click", (e:any, c:Client)=>{
      if(this.selectedClients.indexOf(c.MAC)===-1)
      {
        this.selectedClients.push(c.MAC);
      }else{
        let index = this.selectedClients.indexOf(c.MAC);
        this.selectedClients.splice(index,1);
      }
    })
    //Merge with existing circles
    .merge(circles).transition("time")
      .duration(500)
      .attr("r", (d:Client)=>(this.x2(d.distance24)))
      .attr("stroke-opacity",1);
    

    circles.sort((a:Client,b:Client)=>b.distance24-a.distance24);

    //fade out existing circles and remove previous data
      circles.exit().transition("time")
      .duration(500)
      .attr("r", 0)
      .attr("stroke-opacity",0)
      .remove();
      
  }

  diagramColor(clientGUID:string){
    var color = "";
    //assign color to client if no color has been assigned to client
    if(!(this.colorMap.has(clientGUID))){
      color=environment.palette[Math.floor(Math.random()*environment.palette.length)];
      this.colorMap.set(clientGUID,color);
    }
    return this.colorMap.get(clientGUID);
  }

  checkForClient(clientGUID:string){
    var color = "";
    this.diagramColors.forEach(element => {
      if(element[0]==clientGUID){
        color=element[1];
      }
    });
    return color!==""?true:false;
  }

  groupByType(array:Client[]){
    return array.reduce((r,a)=>{
      r[a.MAC] = r[a.MAC] || [];
      r[a.MAC].push(a);
      return r;
    }, Object.create(null));
  }

  clearSelection(){
    this.selectedClients = [];
  }

  selectClientHistory(sch:any, id:string){
    this.selectedClientHistory={
      key:sch.key,
      value:sch.value,
      color:this.diagramColor(sch.key)
    };
    this.openModal(id);
  }
  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
      this.modalService.close(id);
  }
}
