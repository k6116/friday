import { Component, OnInit, OnDestroy, ViewEncapsulation, Output, Input, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AppDataService } from '../../_shared/services/app-data.service';

declare var $: any;


@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ConfirmModalComponent implements OnInit, OnDestroy {

  // @Output() confirmYesClick = new EventEmitter<any>();
  // @Output() confirmCancelClick = new EventEmitter<any>();

  modal: any;
  subscription1: Subscription;

  constructor(
    private appDataService: AppDataService
  ) { }


  ngOnInit() {

    this.subscription1 = this.appDataService.confirmModalData.subscribe(
      (object: any) => {
        this.modal = object;
        // console.log('confirm modal object:');
        // console.log(this.modal);
        if (this.modal.hasOwnProperty('display')) {
          this.displayModal(this.modal.display);
        }
    });

  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }

  displayModal(display: boolean) {
    if (display) {
      $('#confirm-modal').modal();
    } else {
      $('#confirm-modal').modal('hide');
    }
  }

  onYesButtonClick() {
    this.appDataService.confirmModalResponse.emit(true);
  }

  onCancelButtonClick() {
    this.appDataService.confirmModalResponse.emit(false);
  }


}
