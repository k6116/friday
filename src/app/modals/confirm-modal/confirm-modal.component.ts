import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
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

  modal: any;
  subscription1: Subscription;

  constructor(
    private appDataService: AppDataService
  ) { }


  ngOnInit() {

    this.subscription1 = this.appDataService.confirmModalData.subscribe(
      (object: any) => {
        // set the modal property (object) which will have all the info to render the modal (title, buttons, etc.)
        this.modal = object;
        // display the modal
        $('#confirm-modal').modal({
          backdrop: this.modal.allowOutsideClickDismiss ? true : 'static',
          keyboard: this.modal.allowEscKeyDismiss
        });
    });

  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }

  onModalButtonClick(emit) {
    this.appDataService.confirmModalResponse.emit(emit);
  }


}
