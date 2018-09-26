import { Component, OnInit } from '@angular/core';
import { ApiDataBomService } from '../../_shared/services/api-data/_index';

@Component({
  selector: 'app-bom-viewer',
  templateUrl: './bom-viewer.component.html',
  styleUrls: ['./bom-viewer.component.css', '../../_shared/styles/common.css']
})
export class BomViewerComponent implements OnInit {

  bomJson: any;

  constructor(private apiDataBomService: ApiDataBomService) { }

  ngOnInit() {
  }

  drawBom(bomJson: any) {
    this.bomJson = bomJson;
  }

}
