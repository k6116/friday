import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appFteInputRestrict]'
})
export class FteInputRestrictDirective {

  @HostListener('keypress', ['$event']) onKeyPress(e) {
    const key = e.key;
    const value = e.target.value;
    const text = e.target.value + key;
    const length = +value.length;
    // first character must be 0, 1, or decimal
    if (length === 0 && !(key === '0' || key === '1' || key === '.')) {
      e.preventDefault();
    // second character must be decimal (only if first character is a 0 or 1)
    } else if (length === 1 && (text.substr(0, 1) === '0' || text.substr(0, 1) === '1') && key !== '.') {
      e.preventDefault();
    // second character must be digit from 1 to 9 (only if first character is a decimal)
    } else if (length === 1 && text.substr(0, 1) === '.' && !/[1-9]{1}/.test(key)) {
      e.preventDefault();
    // cannot enter third character if the first two characters were decimal + digit
    } else if (length === 2 && text.substr(0, 1) === '.' && /[1-9]{1}/.test(text.substr(1, 1))) {
      e.preventDefault();
    // can only enter zero for third character if the first two characters were 1.
    } else if (length === 2 && text.substr(0, 2) === '1.' && !(key === '0')) {
      e.preventDefault();
    // can only enter 1-9 for third character if the first two characters were 0.
    } else if (length === 2 && text.substr(0, 2) === '0.' && !/[1-9]{1}/.test(key)) {
      e.preventDefault();
    // can only enter digit for third character
    } else if (length === 2 && !/\d{1}/.test(key)) {
      e.preventDefault();
    // prevent four or more characters
    } else if (length === 3) {
      e.preventDefault();
    }

  }

  constructor() { }

}
