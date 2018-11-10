import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiDataOrgService } from '../../../_shared/services/api-data/_index';

// import { ApiDataBomService } from '../../_shared/services/api-data/_index';
// import { BomService } from '../../_shared/services/bom.service';

declare var $: any;
declare const Bloodhound;

@Component({
  selector: 'app-advanced-filters-typeahead',
  templateUrl: './advanced-filters-typeahead.component.html',
  styleUrls: ['./advanced-filters-typeahead.component.css', '../../../_shared/styles/common.css']
})
export class AdvancedFiltersTypeaheadComponent implements OnInit {

  @Output() selectedBom = new EventEmitter<any>();

  constructor(
    private apiDataOrgService: ApiDataOrgService,
  ) { }

  ngOnInit() {

    // get list of managers for typeahead.js
    const managerEmailAddress = 'ron_nersesian@keysight.com';
    this.apiDataOrgService.getManagementOrgStructure(managerEmailAddress).subscribe( res => {
      console.log('res:', res);

      // initialize bloodhound suggestion engine with data
      const bh = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('fullName'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: res  // flat array of managers from api data service
      });

      // initialize typeahead using jquery
      $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'first-names',
        displayKey: 'fullName',  // use this to select the field name in the query you want to display
        source: bh
      })
      .bind('typeahead:selected', (event, selection) => {
        // once something in the typeahead is selected, trigger this function
        this.onSelect(selection);
      });
    });
  }

  onSelect(selection) {
    console.log('Typeahead select')
  }

  // onBomSelect(selectedBom: any) {
  //   // parse selected BOM info from bom-selector child component
  //   const selectedEntity = selectedBom.EntityType;
  //   const selectedID = selectedEntity === 'Project' ? selectedBom.ParentProjectID : selectedBom.ParentPartID;

  //   // go get the nested BOM JSON from the bomService
  //   this.bomService.getBom(selectedID, selectedEntity).then( res => {
  //     this.selectedBom.emit(res);
  //   });
  // }

}
