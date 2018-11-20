import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';
import { CacheService, ToolsService } from '../../_shared/services/_index';

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

  // title text for validation errors
  supplierTitle = 'Supplier may not contain special characters except: ,.-&() and space';
  mpnTitle = `Manufacturer's Part Number may only contain letters, numbers, and spaces`;
  moqTitle = 'Minimum Order Quantity must be a whole number';
  priceTitle = 'Price must be a decimal number';
  nreTitle = 'Non-recurring Engineering Charge must be a decimal number';
  ltTitle = 'Lead Time must be a whole number';

  constructor(
    private apiDataMatplanService: ApiDataMatplanService,
    private cacheService: CacheService,
    private toolsService: ToolsService,
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

    const textRegex = this.toolsService.regexTypicalText;
    const alphaNumericDash = this.toolsService.regexAlphanumericDash;
    if (quote === undefined) {
      // initialize an empty quote form
      this.quoteForm = this.fb.group({
        supplier: [null, [Validators.required, Validators.pattern(textRegex)]],
        partID: this.selectedPart.ChildID,
        mfgPartNumber: [null, [Validators.required, Validators.pattern(alphaNumericDash)]],
        breaks: this.fb.array([])
      });
    } else {
      // initialize the quote form with values stored locally
      this.quoteForm = this.fb.group({
        supplier: [quote.supplier, [Validators.required, Validators.pattern(textRegex)]],
        partID: quote.partID,
        mfgPartNumber: [quote.mfgPartNumber, [Validators.required, Validators.pattern(alphaNumericDash)]],
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
    const wholePositiveNumbers = this.toolsService.regexWholePositiveNumbers;
    const decimalPositiveNumbers = this.toolsService.regexDecimalPositiveNumbers;
    // helper function to return a formgroup containing the respective price breaks initialized, or an empty formgroup
    if (Object.keys(priceBreak).length === 0) {
      // if we weren't passed any arguments, initialize an empty formgroup
      return this.fb.group({
        id: null,
        leadTime: [null, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        minOrderQty: [null, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        nreCharge: [null, [Validators.required, Validators.pattern(decimalPositiveNumbers)]],
        price: [null, [Validators.required, Validators.pattern(decimalPositiveNumbers)]],
        toBeDeleted: false
      });
    } else {
      // initialize a formgroup with values from the database
      return this.fb.group({
        id: priceBreak.id,
        leadTime: [priceBreak.leadTime, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        minOrderQty: [priceBreak.minOrderQty, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        nreCharge: [priceBreak.nreCharge, [Validators.required, Validators.pattern(decimalPositiveNumbers)]],
        price: [priceBreak.price, [Validators.required, Validators.pattern(decimalPositiveNumbers)]],
        toBeDeleted: false
      });
    }
  }

  onAddClick() {
    // grab the current formArray of price breaks, and push in an empty set of controls (MOQ, price, etc)
    const breakArray = <FormArray>this.quoteForm.controls.breaks;
    breakArray.push(this.addPriceBreak({}));
  }

  onSaveQuote() {
    // submit to database
    this.apiDataMatplanService.updateQuoteForPart(this.quoteForm.value).subscribe(res => {
      // if successful, refresh the quote screen and raise toast
      this.showQuotes(this.selectedPart);
      this.cacheService.raiseToast('success', 'Quote Saved!');
    },
    err => {
      this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
    });

    // dismiss the form modal
    $('#quoteModal').modal('hide');
  }

  onRowDelete(row: any) {
    // when user clicks the trash can, mark a row as to be deleted
    row.controls.toBeDeleted.patchValue(true);
  }

  testForm() {
    console.log(this.quoteForm);
    console.log(this.quoteForm.value);
  }

}
