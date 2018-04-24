import { Pipe, PipeTransform } from '@angular/core';
// const Fuse = require('fuse'); // TODO

@Pipe({
  name: 'filter',
  pure: true
})
export class FilterPipe implements PipeTransform {

  transform(objects: any[], filter: any, property: string, options?: any): any {

    if (!objects || !filter) {
      return objects;
    }

    return objects.filter(object => {
      if (options.matchAny) {
        return (object[property] ? object[property] : '').toString().toLowerCase().includes(filter.toString().toLowerCase());

      } else if (options.matchOptimistic) {
        try {
            const regexp = new RegExp(/[^a-zA-Z0-9\\s]/gm);
            if (object[property]) {
              const p = object[property].replace(regexp, '').toLowerCase();
              const f = filter.replace(regexp, '').toLowerCase();
              return p.includes(f);
            }

         } catch (RegexMatchTimeoutException) {
           console.log('pipe error on smart search');
            return '';
         }

      } else if (options.matchFuzzy) {
              const Options = {
                shouldSort: true,
                threshold: 0.6,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: [
                  object[property]
              ]
              };
              // TODO
              // const f = new Fuse(object[property], Options);
              // return f.search(filter);

      } else {
        return (object[property] ? object[property] : '').substring(0, filter.length).toLowerCase() === filter.toLowerCase();
      }
    });
  }

}
