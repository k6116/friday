import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/_index';

declare var $: any;

@Component({
  selector: 'app-matplan-quote',
  templateUrl: './matplan-quote.component.html',
  styleUrls: ['./matplan-quote.component.css', '../../_shared/styles/common.css']
})
export class MatplanQuoteComponent implements OnInit {

  @Input() projectID: number;
  bom: any; // store BOM to display in view
  selectedPart: any = {};
  quotes: any;  // store quotes to display in view
  quoteForm: FormGroup;
  showQuoteModal = false;

  constructor(
    private apiDataMatplanService: ApiDataMatplanService,
    private cacheService: CacheService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.apiDataMatplanService.showMatplanBom(this.projectID).subscribe( res => {
      this.bom = res;
    });
  }

  showQuotes(part: any) {
    console.log(part);
    this.selectedPart = part;
    this.apiDataMatplanService.showQuotesForPart(part.ChildID).subscribe( res => {
      this.quotes = res;
    });
  }

  editQuote(quote: any) {

    if (quote === undefined) {
      // initialize an empty quote form
      this.quoteForm = this.fb.group({
        supplier: '',
        partID: this.selectedPart.ChildID,
        mfgPartNumber: '',
        breaks: this.fb.array([])
      });
    } else {
      // initialize the quote form with values stored locally
      this.quoteForm = this.fb.group({
        supplier: quote.supplier,
        partID: quote.partID,
        mfgPartNumber: quote.mfgPartNumber,
        breaks: this.fb.array([])
      });

      // push each price break into the quote form
      const breakArray = <FormArray>this.quoteForm.controls.breaks;
      quote.breaks.forEach( priceBreak => {
        breakArray.push(this.addPriceBreak(priceBreak));
      });
    }
    // open the modal
    $('#quoteModal').modal('show');
  }

  addPriceBreak(priceBreak: any): FormGroup {
    // helper function to return a formgroup containing the respective price breaks initialized, or an empty formgroup
    if (Object.keys(priceBreak).length === 0) {
      // if we weren't passed any arguments, initialize an empty formgroup
      return this.fb.group({
        id: null,
        leadTime: null,
        minOrderQty: null,
        nreCharge: null,
        price: null,
        toBeDeleted: false
      });
    } else {
      // initialize a formgroup with values from the database
      return this.fb.group({
        id: priceBreak.id,
        leadTime: priceBreak.leadTime,
        minOrderQty: priceBreak.minOrderQty,
        nreCharge: priceBreak.nreCharge,
        price: priceBreak.price,
        toBeDeleted: false
      });
    }
  }

  onAddClick() {
    const breakArray = <FormArray>this.quoteForm.controls.breaks;
    breakArray.push(this.addPriceBreak({}));
  }

  onSaveQuote() {
    this.apiDataMatplanService.updateQuoteForPart(this.quoteForm.value).subscribe(res => {
      $('#quoteModal').modal('hide');

      this.showQuotes(this.selectedPart);
      this.cacheService.raiseToast('success', 'Quote Saved!');
    },
    err => {
      $('#quoteModal').modal('hide');
      this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
    });
  }

  onRowDelete(row: any) {
    console.log(row);
    row.controls.toBeDeleted.patchValue(true);
  }

  testForm() {
    console.log(this.quoteForm.value);
  }

}
