import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';
import { BomService } from '../../_shared/services/bom.service';

declare var $: any;
declare const Bloodhound;

@Component({
  selector: 'app-bom-selector',
  templateUrl: './bom-selector.component.html',
  styleUrls: ['./bom-selector.component.css', '../../_shared/styles/common.css']
})
export class BomSelectorComponent implements OnInit {

  @Output() selectedBom = new EventEmitter<any>();

  constructor(
    private apiDataBomService: ApiDataBomService,
    private bomService: BomService
  ) { }

  ngOnInit() {
    // get list of bills for typeahead.js
    this.apiDataBomService.index().subscribe( res => {
      console.log('res:', res);

      // initialize bloodhound suggestion engine with data
      const bh = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('PartOrProjectName'),
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
        name: 'bill-names',
        displayKey: 'PartOrProjectName',  // use this to select the field name in the query you want to display
        source: bh
      })
      .bind('typeahead:selected', (event, selection) => {
        // once something in the typeahead is selected, trigger this function
        this.onBomSelect(selection);
      });

    });
  }

  onBomSelect(selectedBom: any) {
    // parse selected BOM info from bom-selector child component
    const selectedEntity = selectedBom.EntityType;
    const selectedID = selectedEntity === 'Project' ? selectedBom.ParentProjectID : selectedBom.ParentPartID;

    // go get the nested BOM JSON from the bomService
    this.bomService.getBom(selectedID, selectedEntity).then( res => {
      this.selectedBom.emit(res);
    });
  }

}
