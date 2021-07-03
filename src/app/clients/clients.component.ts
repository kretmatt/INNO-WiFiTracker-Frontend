// Import statements
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

  // Scan dates / times
  timeOfScan:Date=new Date();
  lastScan:Date = new Date();

  // Clients data
  currentClients:Client[]=[];
  pastClients:Client[]=[];
  clientHistories: [] = [];
  selectedClients: string[]=[];
  selectedClientHistory:ClientHistory;
  subscription:Subscription=new Subscription();
  
  // General diagram properties
  tooltip:any;
  padding:number=50;
  width:number=750-this.padding;
  height:number=400-this.padding;
  colorMap:Map<string,string>=new Map<string,string>();

  // Ring diagram
  ringSVG:any;
  ringX:any;
  ringXAxis:any;

  // Multiline diagram
  multilineSVG:any;
  multilineX:any;
  multilineY:any;
  multilineXAxis:any;
  multilineYAxis:any;

  // Set default value of selectedClientHistory and inject instances of ClientsService and ModalService
  constructor(private clientService: ClientsService, private modalService:ModalService) {
    this.selectedClientHistory = {
      key:"",
      value:[],
      color:"#FFF"
    };
   }

  // Angular lifecycle hook that gets called once content is initialized. Set up subscription and generate diagrams after short timeout
  ngAfterContentInit(): void {
    setTimeout(()=>{
      // Get available width for diagrams
      var w = document.getElementById("diagrams")?.clientWidth;
      if(w!=null){
        this.width = w;
      }
      // Generate diagrams
      this.initRingDiagram();
      this.initMultiLineDiagram();
      // Receive data and set up scubscription
      this.receiveData();
      this.subscription = interval(environment.requestIntervalTime).subscribe(()=>this.receiveData());
    },500);
  }

  // Unsubscribe from subscription to avoid unnecessary calls to API after the component gets destroyed
  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }

  // Retrieve data from API, set values of variables and draw diagrams content
  receiveData(){
    this.clientService.getClients().subscribe(
      (data:any)=>{
        // Set timeOfScan to latest scan
        this.timeOfScan=new Date(data.timeOfScan);
        // Check whether or not the latestScan value is lastScan. If so, skip assignment of data and drawing of diagrams
        if(this.timeOfScan.getTime()!==this.lastScan.getTime()){
          // Set lastScan to timeOfScan
          this.lastScan = this.timeOfScan;
          // Filter invalid data
          var clientJSON = data.data.clients.filter((c:any)=>!(c.MAC==="BSSID"||c.MAC===""||c.MAC==="Station MAC"));
          // Clear currentClients
          this.currentClients=[];
          clientJSON.forEach((c:any) => {
            // Check if entry for client already exists in currentClients to avoid several entries of the same client for the exact same time
            if(this.currentClients.find((c2:Client)=>c2.MAC===c.MAC && c2.timeOfScan===this.timeOfScan)===undefined){
              //Add client data to currentClients array
              this.currentClients.push({
                MAC:c.MAC,
                power:+c.power,
                firstTimeSeen:c.firstTimeSeen,
                lastTimeSeen:c.lastTimeSeen,
                packets:+c.packets,
                BSSID:c.BSSID,
                probes:c.probes,
                distance24:c.distance_2_4ghz,
                distance5:c.distance_5ghz,
                timeOfScan:new Date(data.timeOfScan)
              });
            }
            // Check if entry for client already exists in pastClients to avoid several entries of the same client for the exact same time
            if(this.pastClients.find((c2:Client)=>c2.MAC===c.MAC && c2.timeOfScan===this.timeOfScan)===undefined){
              //Add client data to pastClients array
              this.pastClients.push({
                MAC:c.MAC,
                power:+c.power,
                firstTimeSeen:c.firstTimeSeen,
                lastTimeSeen:c.lastTimeSeen,
                packets:+c.packets,
                BSSID:c.BSSID,
                probes:c.probes,
                distance24:c.distance_2_4ghz,
                distance5:c.distance_5ghz,
                timeOfScan:new Date(data.timeOfScan)
              });
            }
          });
          //Generate ring distance diagram
          this.drawDistances(this.currentClients);
          //Remove old data
          this.pastClients=this.pastClients.filter(c=>c.timeOfScan.getTime()>new Date(Date.now()-environment.sortOutTime).getTime());
          //Generate multi line diagram
          this.drawDistanceHistory(this.pastClients);
          //Group data for
          this.clientHistories = this.groupByType(this.pastClients);
        }
      }
    );
  }

  // Generate container and axes for the ring diagram
  initRingDiagram():void{
    //Initialize the svg element inside the figure tag with the id distance
    this.ringSVG = d3.select("figure#distance")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 "+this.width+" "+this.width)
      .append("g");
    //Initialize scaler for axis
    this.ringX = d3.scaleLinear().domain([0,50]).range([0,(this.width/2)-10]);
    //Create and place axis inside svg element
    this.ringXAxis = this.ringSVG.append("g").attr("transform","translate("+this.width/2+","+this.width/2+")").call(d3.axisBottom(this.ringX));
    //Enable zoom functionality
    var svgcontainer = this.ringSVG;
    svgcontainer.call(d3.zoom().on('zoom',function(e:any){
      svgcontainer.attr("transform",e.transform)
    }));
    //Initially set tooltip opacity to 0
    this.tooltip = d3.select("#tooltip")	
      .style("opacity", 0);
  }

  // Generate container and axes for the multiline diagram 
  initMultiLineDiagram():void{
    // Initialize the svg element inside the figure tag with the id distancehistory
    this.multilineSVG=d3.select("figure#distancehistory")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `-${this.padding} ${this.padding} ${this.width} ${this.height}`)
      .append("g");
    //Initialize scalers for axes
    this.multilineX = d3.scaleTime().rangeRound([0, this.width-this.padding]).domain([new Date(),new Date()]);
    this.multilineY = d3.scaleLinear().domain([0,100]).range([this.height-this.padding,0]);
    //Initialize and place axes inside svg element
    this.multilineYAxis=this.multilineSVG.append("g").attr("transform", `translate(0,${this.padding})`).call(d3.axisLeft(this.multilineY));
    this.multilineXAxis=this.multilineSVG.append("g").attr("transform", "translate(0," + this.height + ")").call(d3.axisBottom(this.multilineX));
    // Add x-Axis label
    this.multilineSVG.append("text")
             .attr("text-anchor","end")
             .attr("x",this.width-this.padding)
             .attr("y",this.height+((this.padding/2)+10))
             .text("Time of the day");
    // Add y-Axis label
    this.multilineSVG.append("text")
             .attr("text-anchor","end")
             .attr("x",-this.padding)
             .attr("y",-this.padding+10)
             .attr("transform","rotate(-90)")
             .text("Distance in meters");
  }

  // Draw / Generate content for the multiline-diagram
  drawDistanceHistory(data:Client[]):void{
    
    // Group client data by MAC (GUID)
    var groupedClientData = d3Collection.nest().key(function(c:any){return c.MAC;}).entries(data); 
    
    // Select max and min values to set the appropriate domain of x and y axes
    var maxdate = data.reduce((a:Client,b:Client)=>{
      return a.timeOfScan>b.timeOfScan?a:b
    }).timeOfScan;
    var mindate = data.reduce((a:Client,b:Client)=>{
      return a.timeOfScan<b.timeOfScan?a:b
    }).timeOfScan;
    var maxdistance = data.reduce((a:Client,b:Client)=>{
      return a.distance24>b.distance24?a:b
    }).distance24;

    // Set domain of x and y axis and animate transition to new axis state
    this.multilineX.domain([mindate,maxdate]);
    this.multilineXAxis.transition().duration(1000).call(d3.axisBottom(this.multilineX));
    this.multilineY.domain([0, maxdistance+5]);
    this.multilineYAxis.transition().duration(1000).call(d3.axisLeft(this.multilineY));

    // Create a line builder with the appropriate scalers and select all lines
    var lineBuilder = d3.line().x((d:any)=>{return this.multilineX(d.timeOfScan)}).y((d:any)=>{return this.multilineY(d.distance24)});
    var lines = this.multilineSVG.selectAll(".chart-line").data(groupedClientData);
    
    // Remove obsolete data
    lines.exit().remove();    
    
    // Set colors of new entries in the diagram. It is important to assign colors first, otherwise there will be inconsistent colors for clients
    lines.attr("stroke",(c:any)=>{
      return this.diagramColor(c.key);
    }).enter().append("path").attr("class","chart-line").attr("fill","none")
    .attr("stroke-width","4px")
    .attr("transform",`translate(0,${this.padding})`);
    
    // Build lines in diagram and set events
    lines.attr("d",(d:any)=>{
      return lineBuilder(d.values);
    }).on("mousemove", (e:any,c:any)=>{
      // Increase stroke width of line
      d3.select(e.originalTarget).style('stroke-width',6);
      // Make tooltip visible
      this.tooltip.style('transform', `translate(${e.layerX}px, ${(e.layerY-2*this.padding)}px)`)
      .style('opacity', 1).style('background-color','#3f51b5').html(c.key)
    })
    .on("mouseout",(e:any)=>{
      //Decrease stroke width of line
      d3.select(e.originalTarget).style('stroke-width',4);
      // Hide tooltip
      this.tooltip.style('opacity',0);
    }).
    on("click", (e:any, c:any)=>{
      // Add specific client to selectedClients or remove specific client from array
      if(this.selectedClients.indexOf(c.key)===-1)
      {
        // Add client
        this.selectedClients.push(c.key);
      }else{
        // Remove client
        let index = this.selectedClients.indexOf(c.key);
        this.selectedClients.splice(index,1);
      }
    });

    //animate lines with dasharray
    lines._groups[0].forEach((e:any) => {
      // Set stroke-dasharray across every line
      d3.select(e).attr("stroke-dasharray", e.getTotalLength() + " " + e.getTotalLength()) 
      // Set offset of dash to length of line in order to hide it
      .attr("stroke-dashoffset", e.getTotalLength())
      .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        // Decrease offset in order to reveal line
        .attr("stroke-dashoffset", 0);
    });

  }

  drawDistances(data:Client[]):void{
    
    //Sort clients by distance (descending)
    data.sort((a:Client,b:Client)=>b.distance24-a.distance24);
    
    //Create new variable called circles. It is a selection of all circle elements inside the svg. Set data context to the new client-dataset from the server 
    var circles=this.ringSVG.selectAll("circle").data(data, function(c:Client){return c.MAC;});
    
    // Get highest distance24 value for setting the scaler and axis
    var maxdistance = data.reduce((a:Client,b:Client)=>{
      return a.distance24>b.distance24?a:b
    }).distance24;
    
    // Set domain of scaler and transition to new state of axis
    this.ringX.domain([0,maxdistance]);
    this.ringXAxis.transition().duration(1000).call(d3.axisBottom(this.ringX));

    // Create a circle element for every client
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
    // Set events for every circle
    .on("mousemove", (e:any,c:Client)=>{
      //Increase stroke width of ring
      d3.select(e.originalTarget).style('stroke-width',4);
      // Make tooltip visible
      this.tooltip.style('transform', `translate(${e.layerX}px, ${(e.layerY-2*this.padding)}px)`)
      .style('opacity', 1).style('background-color','#3f51b5').html(c.MAC+"<br>"+c.distance24+" m")
    })
    .on("mouseout",(e:any)=>{
      //Decrease stroke width of ring 
      d3.select(e.originalTarget).style('stroke-width',2);
      // Hide tooltip
      this.tooltip.style('opacity',0);
    }).
    on("click", (e:any, c:Client)=>{
      // Add specific client to selectedClients or remove specific client from array
      if(this.selectedClients.indexOf(c.MAC)===-1)
      {
        // Add client
        this.selectedClients.push(c.MAC);
      }else{
        // Remove client
        let index = this.selectedClients.indexOf(c.MAC);
        this.selectedClients.splice(index,1);
      }
    })
    // Merge the new circles with already existing circles and transition to new radius value
    .merge(circles).transition("time")
      .duration(500)
      .attr("r", (d:Client)=>(this.ringX(d.distance24)))
      .attr("stroke-opacity",1);
    
    // Remove obsolete data (fade out corresponding circles)
      circles.exit().transition("time")
      .duration(500)
      .attr("r", 0)
      .attr("stroke-opacity",0)
      .remove();
      
  }
  // Method for retrieving (and setting) client colors 
  diagramColor(clientGUID:string){
    var color = "";
    // Assign color to client if no color has been assigned to client
    if(!(this.colorMap.has(clientGUID))){
      // Randomly take a color from the application color palette
      color=environment.palette[Math.floor(Math.random()*environment.palette.length)];
      this.colorMap.set(clientGUID,color);
    }
    // Return client color
    return this.colorMap.get(clientGUID);
  }

  // Group client measurements by MAC (GUID)
  groupByType(array:Client[]){
    return array.reduce((r,a)=>{
      r[a.MAC] = r[a.MAC] || [];
      r[a.MAC].push(a);
      return r;
    }, Object.create(null));
  }

  // Clear selectedClients array
  clearSelection(){
    this.selectedClients = [];
  }

  // Select a clientHistory and open the modal with the clientstats-component
  selectClientHistory(sch:any, id:string){
    // Put the data into a suitable format
    this.selectedClientHistory={
      key:sch.key,
      value:sch.value,
      color:this.diagramColor(sch.key)
    };
    // Open the modal
    this.openModal(id);
  }

  // Method for opening the modal through the modalService property
  openModal(id: string) {
    this.modalService.open(id);
  }

  // Method for closing modal through the modalService property
  closeModal(id: string) {
      this.modalService.close(id);
  }
}
