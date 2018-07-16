import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectTypePipe',
  pure: false
})

// Filter project list by project type
// Usage:
//  item | projectTypePipe : projectTypeID
// Example:
// {{ projectList | projectTypePipe : {ProjectTypeID : 1} }}

export class ProjectTypePipe implements PipeTransform {

  // transform(items: Array<any>, conditions: {[field: string]: number}): Array<any> {
  transform(items: Array<any>, conditions: {[field: string]: any}): Array<any> {
    return items.filter(item => {
      for (const i in conditions) {
          if (item[i] !== conditions[i]) {
              return false;
          }
      }
      return true;
    });
  }

}
