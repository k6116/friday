import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';

declare var $: any;

@Component({
  selector: 'app-matplan-quote',
  templateUrl: './matplan-quote.component.html',
  styleUrls: ['./matplan-quote.component.css', '../../_shared/styles/common.css']
})
export class MatplanQuoteComponent implements OnInit {

  @Input() projectID: number;
  bom: any; // store BOM to display in view
  selectedPartID: number;
  quotes: any;  // store quotes to display in view
  quoteForm: FormGroup;
  showQuoteModal = false;

  constructor(
    private apiDataMatplanService: ApiDataMatplanService,
    private fb: FormBuilder
  ) { }

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

  editQuote(quote: any) {
    console.log(quote);
    // initialize the quote form
    this.quoteForm = this.fb.group({
      quoteID: quote.quoteID,
      supplier: quote.supplier,
      partID: quote.partID,
      mfgPartNum: quote.mfgPartNum,
      breaks: this.fb.array([])
    });

    // push each price break into the quote form
    const breakArray = <FormArray>this.quoteForm.controls.breaks;
    quote.breaks.forEach( priceBreak => {
      breakArray.push(this.addPriceBreak(priceBreak));
    });
    console.log(this.quoteForm);

    // this.showQuoteModal = true;
    // open the modal
    $('#quoteModal').modal('show');
  }

  addPriceBreak(priceBreak: any): FormGroup {
    // helper function to return a formgroup containing the respective price breaks initialized, or an empty formgroup
    if (Object.keys(priceBreak).length === 0) {
      return this.fb.group({
        id: '',
        leadTime: '',
        minOrderQty: '',
        nreCharge: '',
        price: ''
      });
    } else {
      return this.fb.group({
        id: priceBreak.id,
        leadTime: priceBreak.leadTime,
        minOrderQty: priceBreak.minOrderQty,
        nreCharge: priceBreak.nreCharge,
        price: priceBreak.price
      });
    }
  }

  onAddClick() {
    const breakArray = <FormArray>this.quoteForm.controls.breaks;
    breakArray.push(this.addPriceBreak({}));
  }

}
