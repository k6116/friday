import { Injectable } from '@angular/core';

declare var $: any;
declare const Bloodhound;


@Injectable()
export class AdvancedFiltersTypeaheadService {

  projectsList: any;

  constructor() { }


  getManagerTypeahead(that: any, managers: any): any {

    // initialize bloodhound suggestion engine with data
    const bh = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('fullName'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: managers  // flat array of managers from api data service
    });

    // initialize typeahead using jquery
    $('.typeahead2').typeahead({
      hint: true,
      highlight: true,
      minLength: 1,
    },
    {
      name: 'first-names',
      displayKey: 'fullName',  // use this to select the field name in the query you want to display
      source: bh
    })
    .bind('typeahead:selected', (event, selection) => {
      // once something in the typeahead is selected, trigger this function
      that.onSelect(selection);
    });

    $('div.tt-menu').css('border-color', '#e9ecef');

  }

  getProjectsTypeahead(that: any, projectList: any) {
    console.log('In get projectTypeahead service; projects:', projectList);

    // initialize bloodhound suggestion engine with data
    const bh = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('ProjectName'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: projectList  // flat array of managers from api data service
    });

    // initialize typeahead using jquery
    $('typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'project-name',
      displayKey: 'ProjectName',
      source: bh
    })
    .bind('typeahead:selected', (event, selection) => {
      that.onSelect(selection);
    });
  }


}
