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
  orders: any;

  constructor(private apiDataMatplanService: ApiDataMatplanService) { }

  ngOnInit() {
    this.apiDataMatplanService.showMatplanOrders(this.projectID, this.matplanID).subscribe( res => {
      console.log(res);
      this.orders = res;
    });
  }

}
