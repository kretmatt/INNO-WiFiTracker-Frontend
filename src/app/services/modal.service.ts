import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  //All active modals
  private modals: any[]=[];

  add(modal:any){
    this.modals.push(modal);
    console.log(this.modals);
  }

  remove(id:string){
    this.modals = this.modals.filter(x=>x.id!==id);
  }

  open(id:string){
    console.log(id);
    const modal = this.modals.find(x=>x.id===id);
    modal.open();
  }

  close(id:string){
    const modal = this.modals.find(x=>x.id===id);
    modal.close();
  }
}
