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

  noResults: boolean;

  constructor() { }

  ngOnChanges() {

    // console.log('In Results Component:', this.advancedFilteredResults);

    if (this.advancedFilteredResults.length === 0) {
      this.noResults = true;
    } else {
      this.noResults = false;
    }
  }

}
