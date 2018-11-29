import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiDataMatplanService } from '../../_shared/services/api-data/_index';

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
  selectedOrder: FormGroup; // to temporarily store a selected row for patching values

  constructor(
    private fb: FormBuilder,
    private apiDataMatplanService: ApiDataMatplanService
  ) { }

  async ngOnInit() {
    // initialize the order form
    this.orderForm = this.fb.group({
      orderFormArray: this.fb.array([])
    });

    // get the MatOrder data to populate into the form
    const orderList = await this.apiDataMatplanService.showMatplanOrders(this.projectID, this.matplanID).toPromise();

    // populate the form with data
    const bla = await this.initMatOrderForm(orderList);

    // compute the prices in the form
    this.initMatOrderPrices(<FormArray>this.orderForm.get('orderFormArray'));
  }

  initMatOrderForm(orderList: any) {
    // grab pointer to the parent formarray
    const orderFormArray = <FormArray>this.orderForm.get('orderFormArray');

    // loop through all the records from the MatOrder table to fill in the form
    for (let i = 0; i < orderList.length; i++) {
      const newForm = this.fb.group({
        level: orderList[i].level,
        partID: orderList[i].partID,
        partName: orderList[i].partName,
        partDescription: orderList[i].partDescription,
        supplierID: orderList[i].supplierID ? orderList[i].supplierID : null,
        supplierName: orderList[i].supplierName ? orderList[i].supplierName : null,
        mfgPartNumber: orderList[i].mfgPartNumber ? orderList[i].mfgPartNumber : null,
        minOrderQty: null,
        price: null,
        nreCharge: null,
        leadTime: null,
        qtyPer: orderList[i].qtyPer,
        orderQty: orderList[i].orderQty ? orderList[i].orderQty : (orderList[i].qtyPer * this.buildQty),
        totalCost: null,
        purchaseMethodID: orderList[i].purchaseMethodID ? orderList[i].purchaseMethodID : null,
        purchaseOrderNumber: orderList[i].purchaseOrderNumber ? orderList[i].purchaseOrderNumber : null,
        orderDate: orderList[i].orderDate ? orderList[i].orderDate : null,
        dueDate: orderList[i].dueDate ? orderList[i].dueDate : null,
        dateReceived: orderList[i].dateReceived ? orderList[i].dateReceived : null,
        qtyReceived: orderList[i].qtyReceived ? orderList[i].qtyReceived : null,
        deliverTo: orderList[i].deliverTo ? orderList[i].deliverTo : null
      });
      orderFormArray.push(newForm);
    }
    return null;  // doesn't matter what we return, just need something for async/await
  }

  initMatOrderPrices(orders: FormArray) {
    for (const order of orders.controls) {
      this.calculatePrice(<FormGroup>order);
    }
  }

  testForm() {
    console.log('the form');
    console.log(this.orderForm);

    console.log('the values');
    console.log(this.orderForm.value);
  }

  editSupplier(order: any) {
    console.log(order);
    this.selectedOrder = order;
    const selectedPartID = order.get('partID').value;
    this.apiDataMatplanService.showQuotesForPart(selectedPartID).subscribe( res => {
      console.log('got quotes');
      console.log(res);
      this.quotes = res;
      $('#supplierModal').modal('show');
    });
  }

  chooseSupplier(quote: any) {
    console.log(quote);
    this.selectedOrder.get('supplierID').patchValue(quote.supplierID);
    this.selectedOrder.get('supplierName').patchValue(quote.supplierName);
    $('#supplierModal').modal('hide');
  }

  async calculatePrice(order: FormGroup) {
    const selectedSupplierID = order.get('supplierID').value;

    if (selectedSupplierID) {
      // if a supplier has been selected, query the DB for the quote details and patch form values
      const selectedPartID = order.get('partID').value;
      const orderQty = order.get('orderQty').value;
      const quotes = await this.apiDataMatplanService.showSpecificQuote(selectedPartID, selectedSupplierID).toPromise();
      console.log(quotes);
      quotes.forEach( quote => {
        if (orderQty >= quote.minOrderQty) {
          // patch values from selected quote into form
          order.get('minOrderQty').patchValue(quote.minOrderQty);
          order.get('price').patchValue(quote.price);
          order.get('nreCharge').patchValue(quote.nreCharge);
          order.get('leadTime').patchValue(quote.leadTime);
          order.get('totalCost').patchValue((orderQty * quote.price) + quote.nreCharge);
        }
      });
    }
  }

  highlightSmallOrder(order: FormGroup) {
    const orderQty = order.get('orderQty').value;
    const qtyPer = order.get('qtyPer').value;

    if (orderQty < qtyPer * this.buildQty) {
      return 'highlight-invalid';
    }
  }

}
