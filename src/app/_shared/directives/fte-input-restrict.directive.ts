import { Directive, Input, HostListener, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[appFteInputRestrict]'
})
export class FteInputRestrictDirective {

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    this.testKeyPress(event);
  }

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer
  ) { }


  testKeyPress(event) {

    // get the text/value of the input that will be there if the key is allowed
    let text: string;
    if (this.textIsHightlighted(event)) {
      text = event.key;
    } else {
      text = event.target.value + event.key;
    }

    // cancel the keypress if the would be text/value does not conform to one of the accepted formats (using regex)
    // such as 0.5, .8, 1.0
    const regexp = new RegExp(/^[0|1|.]{1}$|^[0|1]{1}[.]{1}$|^[0]{1}[.]{1}[1-9]{1}$|^[.]{1}[1-9]{1}$|^[1]{1}[.]{1}[0]{1}$/);
    if (!regexp.test(text)) {
      event.preventDefault();
    }
  }

  // check whether all the text in the input is highlighted (determines whether they can type over the existing text)
  textIsHightlighted(event): boolean {
    const cursorPositionStart = this.elementRef.nativeElement.selectionStart;
    const cursorPositionEnd = this.elementRef.nativeElement.selectionEnd;
    return cursorPositionStart === 0 && cursorPositionEnd === event.target.value.length;
  }

}
