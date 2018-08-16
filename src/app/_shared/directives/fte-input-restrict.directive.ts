import { Directive, Input, HostListener, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[appFteInputRestrict]'
})
export class FteInputRestrictDirective {

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    const allowedKeys = ['ArrowRight', 'ArrowLeft', 'Delete', 'Backspace', 'Tab'];
    if (allowedKeys.includes(event.code)) {
      // do nothing. manually allowing some 'keypress' events through the filter
    } else {
      this.restrictToNumeric(event);
    }
  }

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer
  ) { }

  restrictToNumeric(event) {
    // simple regex to restrict each input key to only numbers
    const regexp = new RegExp(/[0-9]/);
    if (!regexp.test(event.key)) {
      event.preventDefault();
    }
  }

}
