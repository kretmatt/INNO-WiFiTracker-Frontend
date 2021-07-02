//Import statements
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  //All active modals
  private modals: any[]=[];

  // Method for adding modal instance to ModalService
  add(modal:any){
    this.modals.push(modal);
  }

  // Method for removing modal instance from ModalService
  remove(id:string){
    this.modals = this.modals.filter(x=>x.id!==id);
  }

  // Method for redirecting open-Request to the corresponding modal instance
  open(id:string){
    const modal = this.modals.find(x=>x.id===id);
    modal.open();
  }

  // Method for redirecting close-Request to the corresponding modal instance
  close(id:string){
    const modal = this.modals.find(x=>x.id===id);
    modal.close();
  }
}
