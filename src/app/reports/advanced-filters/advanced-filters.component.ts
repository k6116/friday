import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ToolsService } from '../../_shared/services/tools.service';
import { ApiDataAdvancedFilterService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';
import { CacheService } from '../../_shared/services/cache.service';


declare var $: any;

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.css', '../../_shared/styles/common.css']
})
export class AdvancedFiltersComponent implements OnInit, OnDestroy {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;

  showSpinner: boolean;
  showPage: boolean;
  showDownloadingIcon: boolean;
  htmlElement: any;


  filterString: string;
  filterCheckedArray: any;

  subscription2: Subscription;


  advancedFilterData: any;
  projects: any;
  projectTypes: any;
  projectStatuses: any;
  projectPriorities: any;
  plcStatuses: any;


  constructor(
    private toolsService: ToolsService,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private cacheService: CacheService,

  ) { 

    // listen for websocket message for newly created projects
    this.subscription2 = this.cacheService.showDownloadingIcon.subscribe(show => {
      this.showDownloadingIcon = show;
    });

  }

  async ngOnInit() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // show the spinner
    this.showSpinner = true;

    // get all data for the page using forkjoin: project, schedule, and roster
    this.advancedFilterData = await this.getAdvancedFilterData()
    .catch(err => {
      console.log(err);
    });

    this.projects = this.advancedFilterData[0];
    this.projectTypes = this.advancedFilterData[1];
    this.projectStatuses = this.advancedFilterData[2];
    this.projectPriorities = this.advancedFilterData[3];
    this.plcStatuses = this.advancedFilterData[4];


    // hide the spinner
    this.showSpinner = false;
    console.log('Advanced filter data:', this.advancedFilterData);
    console.log('projects:', this.projects);

    this.showPage = true;

    this.filterCheckedArray = [];
  }

  ngOnDestroy() {

    this.subscription2.unsubscribe();

  }

  async getAdvancedFilterData(): Promise<any> {

    return await this.apiDataAdvancedFilterService.getAdvancedFilterData().toPromise();

  }

  // SEARCH BAR
  
  // on clicking the 'x' icon at the right of the search/filter input
  onClearSearchClick() {
    // clear the filter string
    this.filterString = undefined;
    // reset the focus on the filter input
    this.filterStringVC.nativeElement.focus();
    // update the count display (showing x of y) by calling onFilterStringChange()
    // this.onFilterStringChange();
  }

  onCheckboxFilterClick(event: any) {
    console.log(event);
    const value = event.target.checked;
    const name = event.target.name;
    let index = 0;

    if (value === true) {
      // Add checkbox ID to array
      this.filterCheckedArray.splice(0, 0, event.target.name);
    } else {
      // Else, find array position of the checkbox ID and remove
      for (let i = 0; i < this.filterCheckedArray.length; i++) {
        if (this.filterCheckedArray[i] === name) {
          index = i;
        }
      }
      this.filterCheckedArray.splice(index, 1);
    }

    // console.log(this.filterCheckedArray);

  }

  onBadgeCloseClick(event: any) {
    const title = event.target.title;

    // remove string from checklist array    
    for (let i = 0; i < this.filterCheckedArray.length; i++) {
      if (this.filterCheckedArray[i] === title) {
        this.filterCheckedArray.splice(i, 1);
      }
    }

    // find the right checkbox and uncheck
    this.htmlElement = document.getElementsByName(title);
    this.htmlElement[0].checked = false;

  }

// EXPORT FUNCTION

  onExportButtonMouseEnter() {

    const options = {
      title: 'Download Excel File',
      placement: 'left'
    };

    $('button.export-button').tooltip(options);
    $('button.export-button').tooltip('show');

  }

  onExportButtonMouseLeave() {
    $('button.export-button').tooltip('dispose');
  }

  onExportClick() {

    // show the animated downloading icon
    this.showDownloadingIcon = true;

    console.log('Export Button Clicked');

    setTimeout(() => {
      this.showDownloadingIcon = false;
    }, 1000);
  }

}