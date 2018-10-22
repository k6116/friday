import { Component, OnInit, Input } from '@angular/core';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';


@Component({
  selector: 'app-matplan-quote',
  templateUrl: './matplan-quote.component.html',
  styleUrls: ['./matplan-quote.component.css', '../../_shared/styles/common.css']
})
export class MatplanQuoteComponent implements OnInit {

  @Input() projectID: number;
  bom: any;
  selectedPartID: number;
  quotes: any;

  constructor(private apiDataMatplanService: ApiDataMatplanService) { }

  ngOnInit() {
    this.apiDataMatplanService.showMatplanBom(this.projectID).subscribe( res => {
      this.bom = res;
    });
  }

  showQuotes(part: any) {
    this.selectedPartID = part.ChildID;
    this.apiDataMatplanService.showQuotesForPart(part.ChildID).subscribe( res => {
      this.quotes = res;
    });
  }

}
