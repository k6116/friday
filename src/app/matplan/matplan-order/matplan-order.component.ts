import { Component, OnInit, Input } from '@angular/core';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';

@Component({
  selector: 'app-matplan-order',
  templateUrl: './matplan-order.component.html',
  styleUrls: ['./matplan-order.component.css', '../../_shared/styles/common.css']
})
export class MatplanOrderComponent implements OnInit {

  @Input() projectID: number;
  @Input() matplanID: number;
  bom: any;

  constructor(private apiDataMatplanService: ApiDataMatplanService) { }

  ngOnInit() {
    this.apiDataMatplanService.showMatplanBom(this.projectID).subscribe( res => {
      this.bom = res;
    });
  }

  showOrders(item: any) {
    console.log('clicked item');
    console.log(item);
    this.apiDataMatplanService.showOrdersForPart(this.matplanID, item.ChildID).subscribe( res => {
      console.log(res);
    });
  }

}
