import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { CacheService } from '../../_shared/services/cache.service';

declare var $: any;


@Component({
  selector: 'app-carousel-modal',
  templateUrl: './carousel-modal.component.html',
  styleUrls: ['./carousel-modal.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CarouselModalComponent implements OnInit, OnDestroy {

  modal: any;
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(
    private cacheService: CacheService
  ) { }


  ngOnInit() {

    this.subscription1 = this.cacheService.carouselModalData.subscribe(
      (object: any) => {
        // set the modal property (object) which will have all the info to render the modal (title, buttons, etc.)
        this.modal = object;
        // display the modal
        $('#carousel-modal').modal({
          backdrop: this.modal.allowOutsideClickDismiss ? true : 'static',
          keyboard: this.modal.allowEscKeyDismiss
        });
    });

    this.subscription2 = this.cacheService.carouselModalClose.subscribe(
      (close: boolean) => {
        // close the modal (regardless of the value, but by convention should pass true)
        $('#carousel-modal').modal('hide');
    });

  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }

  onModalButtonClick(emit) {
    this.cacheService.carouselModalResponse.emit(emit);
  }


}
