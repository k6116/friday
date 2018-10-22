import { Component, OnInit, Input } from '@angular/core';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';

@Component({
  selector: 'app-matplan-bom',
  templateUrl: './matplan-bom.component.html',
  styleUrls: ['./matplan-bom.component.css', '../../_shared/styles/common.css']
})
export class MatplanBomComponent implements OnInit {

  @Input() projectID: number;
  bom: any;

  constructor(private apiDataMatplanService: ApiDataMatplanService) { }

  ngOnInit() {
    this.apiDataMatplanService.showMatplanBom(this.projectID).subscribe( res => {
      this.bom = res;
      this.bom.forEach( item => {
        if (item.Level > 1) {
          const indentedName = new Array(item.Level - 1).concat(item.ChildName);
          item.ChildIndentedName = indentedName.join('-');
        } else {
          item.ChildIndentedName = item.ChildName;
        }
      });
      console.log(this.bom);
    });
  }

}
