import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appFteInputRestrict]'
})
export class FteInputRestrictDirective {

  @Input() numChars: number;
  @Input() allowDecimal: boolean;

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    console.log(event);
    console.log(this.numChars);
    console.log(this.allowDecimal);
  }

  constructor() { }

}
