import { Component, OnInit, OnDestroy, ViewEncapsulation, Output, Input, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { CacheService } from '../../_shared/services/cache.service';

declare var $: any;


@Component({
  selector: 'app-notice-modal',
  templateUrl: './notice-modal.component.html',
  styleUrls: ['./notice-modal.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class NoticeModalComponent implements OnInit, OnDestroy {

  @Output() confirmOkClick = new EventEmitter<any>();

  modal: any;
  subscription1: Subscription;


  constructor(
    private cacheService: CacheService
  ) { }


  ngOnInit() {

    this.subscription1 = this.cacheService.noticeModalData.subscribe(
      (object: any) => {
        this.modal = object;
        // console.log('notice modal object:');
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
      $('#notice-modal').modal();
    }
  }

  onOkButtonClick() {
    // console.log('ok button clicked in notice modal component');
    this.confirmOkClick.emit(null);
  }



}
