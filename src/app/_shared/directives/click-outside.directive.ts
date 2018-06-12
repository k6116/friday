import { Directive, ElementRef, Input, Output, EventEmitter, HostListener } from '@angular/core';

declare var $: any;

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {

  constructor(private elementRef: ElementRef) {
  }

  // take optional input for element selector, to ignore if clicked on
  // (not considered to be clicked outside) for example an icon when clicked shows or hides a div
  @Input() exception: string;

  @Output()
  public appClickOutside = new EventEmitter<any>();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    // NOTE: elementRef is the container element that the directive is placed on (that should be closed/hidden on click outside)
    // targetElement is the element that was clicked on

    // check if the element clicked on is inside (child) of the parent (container) element (returns true or false)
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);

    // check if the 'exception' element was clicked on
    let clickedOnException = false;
    if (this.exception) {
      const $targetElement = $(targetElement);
      const $excludedElement = $(this.exception);
      if ($targetElement.closest($excludedElement).length) {
        clickedOnException = true;
      }
    }

    // if the click was not inside and not on the exception,
    // emit event with the target element (could emit anything like true, etc. but target element might be useful)
    if (!clickedInside && !clickedOnException) {
      this.appClickOutside.emit(targetElement);
    }

  }

}
