import { Injectable } from '@angular/core';
import { FilterPipe } from '../../../_shared/pipes/filter.pipe';
import { ProjectFteRollupChartService } from './project-fte-rollup-chart.service';

declare var $: any;

@Injectable()
export class ProjectFteRollupTypeaheadService {

  projectsList: any;


  constructor(
    private filterPipe: FilterPipe,
    private projectFteRollupChartService: ProjectFteRollupChartService
  ) { }


  // initialize the typeahead functionality:  jQuery.typeahead(options, [*datasets])
  initTypeahead(that: any, projectsList: any): any {

    // set 'this' in order to access the methods within this service within the typeahead source or bind functions
    // (this will lose/change its scope to the function)
    const that2 = this;

    // set the projects list locally so the typeahead can filter the list using the pipe
    this.projectsList = projectsList;

    // note: 'that' is referring to the project fte rollup component
    // note: 'that2' is referring to this service: project fte rollup typeahead

    // initialize the typeahead input with the options and dataset
    return $('.projects-filter-input').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'projects',
      displayKey: 'ProjectNameAndType',
      limit: 50,
      source: function(query, process) {
        // NOTE: query will be whatever text is typed into the input element
        // if the filterString is undefined, null, or an empty string, then override the query to avoid ?
        if (!that.filterString) {
          query = undefined;
        }
        // get an array of filtered project objects using the filter pipe with fuzzy search
        const filteredProjects = that2.getFilteredProjects(query);
        // process the array of objects to set the typeahead values
        process(filteredProjects);
      }
    })
    .bind('typeahead:selected', (event, selection) => {
      // set the focus on a hidden element behind the typeahead to force the typeahead input to lose focus
      that.hiddenInput.nativeElement.focus();
      // clear/reset existing chart and table data
      that2.projectFteRollupChartService.clearChartData(that);
      // render the chart, or blank chart if there is no data to display
      // that.renderLokiChart(selection);
      that.displayChart(selection);
    });

  }

  // return an array of filtered project objects using the filter pipe with fuzzy search
  getFilteredProjects(query): any {

    return this.filterPipe.transform(this.projectsList, query, 'ProjectName',
      {matchFuzzy: {on: true, threshold: 0.4}, returnAll: false});

  }

}
