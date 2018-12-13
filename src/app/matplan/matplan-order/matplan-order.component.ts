import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';

declare var $: any;
@Component({
  selector: 'app-matplan-order',
  templateUrl: './matplan-order.component.html',
  styleUrls: ['./matplan-order.component.css', '../../_shared/styles/common.css']
})
export class MatplanOrderComponent implements OnInit {

  @Input() projectID: number;
  @Input() matplanID: number;
  @Input() buildQty: number;

  quotes: any;
  orderForm: FormGroup;
  purchaseMethods: any; // for temporarily storing the array of purchase methods for frontend
  selectedOrder: FormGroup; // to temporarily store a selected row for patching values

  constructor(
    private fb: FormBuilder,
    private apiDataMatplanService: ApiDataMatplanService,
    private cacheService: CacheService
  ) { }

  async ngOnInit() {
    // initialize the order form
    this.orderForm = this.fb.group({
      orderFormArray: this.fb.array([])
    });

    this.apiDataMatplanService.indexPurchaseMethod().subscribe( res => {
      this.purchaseMethods = res;
    });

    // get the MatOrder data to populate into the form
    const orderList = await this.apiDataMatplanService.showMatplanOrders(this.projectID, this.matplanID).toPromise();

    // populate the form with data
    const bla = await this.initMatOrderForm(orderList);

    // compute the prices in the form
    const orderFormArray = <FormArray>this.orderForm.get('orderFormArray');
    for (const order of orderFormArray.controls) {
      this.calculatePrice(<FormGroup>order);
    }
  }

  initMatOrderForm(orderList: any) {
    // grab pointer to the parent formarray
    const orderFormArray = <FormArray>this.orderForm.get('orderFormArray');

    // loop through all the MatOrder records to fill in the form
    for (let i = 0; i < orderList.length; i++) {
      const newForm = this.fb.group({
        materialOrderID: orderList[i].materialOrderID,
        materialPlanID: orderList[i].materialPlanID,
        level: orderList[i].level,
        partID: orderList[i].partID,
        partName: orderList[i].partName,
        partDescription: orderList[i].partDescription,
        supplierID: orderList[i].supplierID,
        supplierName: orderList[i].supplierName,
        mfgPartNumber: orderList[i].mfgPartNumber,
        minOrderQty: null,
        price: null,
        nreCharge: null,
        leadTime: null,
        qtyPer: orderList[i].qtyPer,
        qtyNeeded: (orderList[i].qtyPer * this.buildQty),
        orderQty: orderList[i].orderQty,
        totalCost: null,
        purchaseMethodID: orderList[i].purchaseMethodID,
        purchaseOrderNumber: orderList[i].purchaseOrderNumber,
        orderDate: orderList[i].orderDate,
        dueDate: orderList[i].dueDate,
        dateReceived: orderList[i].dateReceived,
        qtyReceived: orderList[i].qtyReceived,
        deliverTo: orderList[i].deliverTo
      });
      orderFormArray.push(newForm);
    }
    return null;  // doesn't matter what we return, just need something for async/await
  }

  onMatplanSave() {
    // get pointer to parent formarray
    const orderFormArray = <FormArray>this.orderForm.get('orderFormArray');

    // get flattened formarray records
    const orderFormFlat = this.orderForm.value.orderFormArray;

    // parse the FormGroup and collect the records that have changed
    const changedValues = [];
    for (let i = 0; i < orderFormArray.controls.length; i++) {
      if (orderFormArray.controls[i].dirty) {
        // if control has been altered, then we need to submit it for changes
        changedValues.push(orderFormFlat[i]);
      }
    }

    // build object to send to database
    const toBeSaved = {
      matplan: changedValues,
      matplanID: this.matplanID
    };

    // send to db
    this.apiDataMatplanService.updateMaterialOrder(toBeSaved).subscribe( res => {
      this.cacheService.raiseToast('success', `${res.message}`);
      this.ngOnInit();  // refresh the form to get new UIDs
    },
    err => {
      this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
    });
  }

  testForm() {
    console.log('the form');
    console.log(this.orderForm);

    console.log('the values');
    console.log(this.orderForm.value);
  }

  editSupplier(order: any) {
    // when user clicks button to change suppliers, pull the available quotes and display in modal
    this.selectedOrder = order;
    const selectedPartID = order.get('partID').value;
    this.apiDataMatplanService.showQuotesForPart(selectedPartID).subscribe( res => {
      this.quotes = res;
      $('#supplierModal').modal('show');
    });
  }

  chooseSupplier(quote: any) {
    // when user selects one of the supplier options from the modal, patch the form and close the modal
    this.selectedOrder.get('supplierID').patchValue(quote.supplierID);
    this.selectedOrder.get('supplierName').patchValue(quote.supplierName);
    this.selectedOrder.markAsDirty();
    this.calculatePrice(this.selectedOrder);
    $('#supplierModal').modal('hide');
  }

  async calculatePrice(order: FormGroup) {
    const selectedSupplierID = order.get('supplierID').value;

    if (selectedSupplierID) {
      // if a supplier has been selected, query the DB for the quote details and patch form values
      const selectedPartID = order.get('partID').value;
      const orderQty = order.get('orderQty').value;
      const quotes = await this.apiDataMatplanService.showSpecificQuote(selectedPartID, selectedSupplierID).toPromise();

      quotes.forEach( quote => {
        if (orderQty >= quote.minOrderQty) {
          // patch values from selected quote into form
          order.get('mfgPartNumber').patchValue(quote.mfgPartNumber);
          order.get('minOrderQty').patchValue(quote.minOrderQty);
          order.get('price').patchValue(quote.price);
          order.get('nreCharge').patchValue(quote.nreCharge);
          order.get('leadTime').patchValue(quote.leadTime);
          order.get('totalCost').patchValue((orderQty * quote.price) + quote.nreCharge);
        }
      });
    }
  }

}
