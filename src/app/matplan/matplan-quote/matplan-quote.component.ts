import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FilterPipe } from '../../_shared/pipes/filter.pipe';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';
import { CacheService, ToolsService } from '../../_shared/services/_index';

declare var $: any;

@Component({
  selector: 'app-matplan-quote',
  templateUrl: './matplan-quote.component.html',
  styleUrls: ['./matplan-quote.component.css', '../../_shared/styles/common.css'],
  providers: [FilterPipe]
})
export class MatplanQuoteComponent implements OnInit {

  @Input() projectID: number;
  bom: any; // store BOM to display in view
  suppliers: any; // store suppliers for use in view
  selectedPart: any = {};
  quotes: any;  // store quotes to display in view
  quoteForm: FormGroup;
  showQuoteModal = false;
  typeahead = {}; // place to store typeahead instance to make sure we don't initialize it twice

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
    private fb: FormBuilder,
    private filterPipe: FilterPipe
  ) { }

  ngOnInit() {
    // get BOM
    this.apiDataMatplanService.showMatplanBom(this.projectID).subscribe( res => {
      this.bom = res;
    });

    // get supplier list for typeahead
    this.getSupplierList();

    // attach listener to form modal to clear out the reactive form whenever the form modal is dismissed
    $('#quoteModal').on('hidden.bs.modal', () => {
      this.quoteForm.reset();

      // also clear out typeahead query value to prevent "automatic population" next time it's invoked
      $('.supplier-typeahead').typeahead('val', '');
    });
  }

  getSupplierList() {
    // get list of suppliers for use in typeahead
    this.apiDataMatplanService.indexSuppliers().subscribe( res => {
      this.suppliers = res;
    });
  }

  showQuotes(part: any) {
    this.selectedPart = part;
    this.apiDataMatplanService.showQuotesForPart(part.ChildID).subscribe( res => {
      this.quotes = res;
    });
  }

  editQuote(quote: any) {
    // build the formgroup
    this.quoteForm = this.initializeQuoteform(quote);

    if (quote !== undefined) {
      // push each price break into the quote form
      const breakArray = <FormArray>this.quoteForm.controls.breaks;
      quote.breaks.forEach( priceBreak => {
        breakArray.push(this.addPriceBreak(priceBreak));
      });
    } else {
      // push in an empty price break to start a blank form
      this.onAddClick();
    }

    // open the modal
    $('#quoteModal').modal('show');

    setTimeout(() => {
      // workaround to initialize typeahead after ngIf for form modal draws to the component
      if (Object.keys(this.typeahead).length === 0) {
        this.typeahead = this.initializeTypeahead();
      }
    }, 0);

  }

  initializeQuoteform(quote: any) {
    const textRegex = this.toolsService.regexTypicalText;
    const alphaNumericDash = this.toolsService.regexAlphanumericDash;
    if (quote === undefined) {
      // initialize an empty quote form
      return this.fb.group({
        supplierID: null,
        supplierName: [null, [Validators.required, Validators.pattern(textRegex)]],
        partID: this.selectedPart.ChildID,
        mfgPartNumber: [null, [Validators.required, Validators.pattern(alphaNumericDash)]],
        breaks: this.fb.array([])
      });
    } else {
      // find matching supplier name from supplier array, or return null
      const supplier = this.suppliers.filter( sup => sup.supplierID === quote.supplierID);

      // initialize the quote form with values stored locally
      return this.fb.group({
        supplierID: quote.supplierID,
        supplierName: [supplier[0] ? supplier[0].supplierName : null, [Validators.required, Validators.pattern(textRegex)]],
        partID: quote.partID,
        mfgPartNumber: [quote.mfgPartNumber, [Validators.required, Validators.pattern(alphaNumericDash)]],
        breaks: this.fb.array([])
      });
    }
  }

  initializeTypeahead() {
    const self = this;  // getting outside 'this' context for typeahead

    // initialize the typeahead
    return $('.supplier-typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 0
    },
    {
      name: 'suppliers',
      displayKey: 'supplierName',
      limit: 50,
      source: function(query, process) {
        // get an array of filtered project objects using the filter pipe with fuzzy search
        const filteredSuppliers = self.filterPipe.transform(self.suppliers, query, 'supplierName',
          {matchFuzzy: {on: true, threshold: 0.4}, returnAll: true}
        );
        // process the array of objects to set the typeahead values
        process(filteredSuppliers);
      }
    });
  }

  addPriceBreak(priceBreak: any): FormGroup {
    const wholePositiveNumbers = this.toolsService.regexWholePositiveNumbers;
    const decimalPositiveNumbers = this.toolsService.regexDecimalPositiveNumbers;
    // helper function to return a formgroup containing the respective price breaks initialized, or an empty formgroup
    if (Object.keys(priceBreak).length === 0) {
      // if we weren't passed any arguments, initialize an empty formgroup
      return this.fb.group({
        quoteID: null,
        leadTime: [null, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        minOrderQty: [null, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        nreCharge: [null, [Validators.required, Validators.pattern(decimalPositiveNumbers)]],
        price: [null, [Validators.required, Validators.pattern(decimalPositiveNumbers)]],
        toBeDeleted: false
      });
    } else {
      // initialize a formgroup with values from the database
      return this.fb.group({
        quoteID: priceBreak.quoteID,
        leadTime: [priceBreak.leadTime, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        minOrderQty: [priceBreak.minOrderQty, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        nreCharge: [priceBreak.nreCharge, [Validators.required, Validators.pattern(decimalPositiveNumbers)]],
        price: [priceBreak.price, [Validators.required, Validators.pattern(decimalPositiveNumbers)]],
        toBeDeleted: false
      });
    }
  }

  onSupplierBlur(name: string) {

    // check the suppliers list to see if their entry is in there
    const match = this.suppliers.find( supplier => supplier.supplierName === name);

    if (match !== undefined) {
      // if we found a match, patch value with the matching supplier ID
      this.quoteForm.controls.supplierID.patchValue(match.supplierID);
      this.quoteForm.controls.supplierName.patchValue(match.supplierName);
    } else {
      this.quoteForm.controls.supplierID.patchValue(null);
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
      this.getSupplierList();
      this.cacheService.raiseToast('success', `${res.message}`);
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

  deleteQuote(quote: any) {

    this.cacheService.confirmModalData.emit(
      {
        title: 'Confirm Deletion',
        message: `Are you sure you want to permanently delete the quote from ${quote.supplierName}?`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(193, 193, 27)',
        closeButton: true,
        allowOutsideClickDismiss: false,
        allowEscKeyDismiss: false,
        buttons: [
          {
            text: 'Yes',
            bsClass: 'btn-success',
            emit: true
          },
          {
            text: 'Cancel',
            bsClass: 'btn-secondary',
            emit: false
          }
        ]
      }
    );

    const deleteModalSubscription = this.cacheService.confirmModalResponse.subscribe( res => {

      if (res) {
        // user confirmed delete
        this.apiDataMatplanService.destroyQuoteForPart(quote).subscribe( res2 => {
          // if successful, refresh the quote screen and raise toast
          this.showQuotes(this.selectedPart);
          this.cacheService.raiseToast('success', `${res2.message}`);
        },
        err => {
          this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
        });
      }

      // unsubscribe to not get any rogue confirms
      deleteModalSubscription.unsubscribe();
    });
  }

  testForm() {
    console.log(this.quoteForm);
    console.log(this.quoteForm.value);
  }

}
