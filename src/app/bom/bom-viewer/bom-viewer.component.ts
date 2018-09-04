import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bom-viewer',
  templateUrl: './bom-viewer.component.html',
  styleUrls: ['./bom-viewer.component.css', '../../_shared/styles/common.css']
})
export class BomViewerComponent implements OnInit {

  selectedBom: any;

  constructor() { }

  ngOnInit() {
  }

  onBomSelect(selection: any) {
    this.selectedBom = selection;
  }

}
