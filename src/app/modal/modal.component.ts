// Import statements
import { Component, ViewEncapsulation, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'wt-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class ModalComponent implements OnInit, OnDestroy {
    
    // Id of modal element
    @Input() id: string="";

    // Modal instance reference (element)
    private element: any;

    // Set element as this particular modal instance for easy access and inject ModalService instance
    constructor(private modalService: ModalService, private el: ElementRef) {
        this.element = el.nativeElement;
    }

    ngOnInit(): void {
        // Ensure id of modal is set
        if (!this.id || this.id==="") {
            console.error('modal must have an id');
            return;
        }

        // Move element to bottom of page (just before </body>) so it can be displayed above everything else
        document.body.appendChild(this.element);

        // Add click event to black background for closing the modal
        this.element.addEventListener('click', (el:any) => {
            if (el.target.className === 'wt-modal') {
                this.close();
            }
        });

        // Add this modal instance to ModalService so it's easily accesible through ModalService
        this.modalService.add(this);
    }

    // Automatically remove the modal from ModalService if the component is destroyed
    ngOnDestroy(): void {
        this.modalService.remove(this.id);
        this.element.remove();
    }

    // "Open" the modal component and make it visible
    open(): void {
        this.element.style.display = 'block';
        document.body.classList.add('wt-modal-open');
    }

    // "Close" the modal component and hide it from the user
    close(): void {
        this.element.style.display = 'none';
        document.body.classList.remove('wt-modal-open');
    }

}
