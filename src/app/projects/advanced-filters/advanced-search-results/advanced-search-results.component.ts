import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-advanced-search-results',
  templateUrl: './advanced-search-results.component.html',
  styleUrls: ['./advanced-search-results.component.css']
})
export class AdvancedSearchResultsComponent implements OnChanges {

  @Input() advancedFilteredResults: any;
  @Input() filterObject: any;
  @Input() plcSchedules: any;

  changeLog: string[] = [];

  constructor() { }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    console.log('In Results Component:', this.advancedFilteredResults);
  }

}
