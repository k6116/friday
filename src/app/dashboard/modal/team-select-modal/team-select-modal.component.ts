import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-team-select-modal',
  templateUrl: './team-select-modal.component.html',
  styleUrls: ['./team-select-modal.component.css']
})
export class TeamSelectModalComponent implements OnInit, OnDestroy {

  @Input() nestedManagerData: any;
  @Output() close = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
    console.log('team select modal component initialized');
    console.log('nested manager data structure in modal:');
    console.log(this.nestedManagerData);
  }

  ngOnDestroy() {
    console.log('team select modal component destroyed');
  }

  closeModal() {
    this.close.emit(true);
  }

}
