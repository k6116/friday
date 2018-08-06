import { Directive, Input, HostListener, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[appFteInputRestrict]'
})
export class FteInputRestrictDirective {

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    if (event.keyCode === 8 || event.keyCode === 9 || event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 46 ) {
      // do nothing. Firefox interprets backspace (8), tab (9), arrow keys (37, 39), and delete (46) as 'keypress' events
      // while Chrome and Edge do not.  having this case allows us to manually allow those keystrokes through the filter
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
