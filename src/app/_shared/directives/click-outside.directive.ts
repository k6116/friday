import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {

  constructor(private elementRef: ElementRef) {
  }

  @Output()
  public appClickOutside = new EventEmitter<any>();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    console.log('click outside directive fired');
    // console.log(this.elementRef.nativeElement);
    // console.log(targetElement);
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    // console.log(clickedInside);
    if (!clickedInside) {
      console.log('directive is emitting for click outside');
      this.appClickOutside.emit(targetElement);
    }

  }

}
