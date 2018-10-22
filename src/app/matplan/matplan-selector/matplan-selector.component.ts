import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataMatplanService } from '../../_shared/services/api-data/api-data-matplan.service';

declare var $: any;
declare const Bloodhound;

@Component({
  selector: 'app-matplan-selector',
  templateUrl: './matplan-selector.component.html',
  styleUrls: ['./matplan-selector.component.css', '../../_shared/styles/common.css']
})
export class MatplanSelectorComponent implements OnInit {

  matplanList: any;

  constructor(
    private router: Router,
    private apiDataMatplanService: ApiDataMatplanService
  ) { }

  ngOnInit() {
    // get list of projects, and filter using typeahead in input box
    this.apiDataMatplanService.indexProjects().subscribe( res => {

       // initialize bloodhound suggestion engine with data
       const bh = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('ProjectName'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: res  // flat array of bills from api data service
      });

      // initialize typeahead using jquery
      $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'project-names',
        displayKey: 'ProjectName',  // use this to select the field name in the query you want to display
        source: bh
      })
      .bind('typeahead:selected', (event, selection) => {
        // once something in the typeahead is selected, trigger this function
        this.onProjectSelect(selection);
      });

    });
  }

  onProjectSelect(selectedProject: any) {
    // when a project has been selected, show all available matplans for it
    this.apiDataMatplanService.showMatplans(selectedProject.ProjectID).subscribe( res => {
      this.matplanList = res;
    });
  }

  editMatplan(matplan: any) {
    // send user to matplan-editor component
    this.router.navigate([`/main/matplan/edit/${matplan.MaterialPlanID}`]);
  }

}
