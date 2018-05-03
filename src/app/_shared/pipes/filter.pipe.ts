import { Pipe, PipeTransform } from '@angular/core';
import * as Fuse from 'fuse.js';
declare var $: any;

@Pipe({
  name: 'filter',
  pure: true
})
export class FilterPipe implements PipeTransform {

  transform(objects: any[], filter: any, property: string, options?: any): any {


    // check if a filter was provided (through string or options object)
    let hasFilter: boolean;
    if (filter) {
      hasFilter = true;
    } else if (options.hasOwnProperty('limitTo')) {
      hasFilter = true;
    } else if (options.hasOwnProperty('paginationFilter')) {
      hasFilter = options.paginationFilter.on;
    } else {
      hasFilter = false;
    }
    // const hasFilter = options.hasOwnProperty('paginationFilter') || filter ? true : false;

    // return all (or nothing) if no objects or no filter given
    if (!objects || !hasFilter) {
      return objects;
    }

    // no string filter, but has pagination filter turned on
    if (!filter && options.hasOwnProperty('paginationFilter')) {
      if (options.paginationFilter.on) {
        const regexp = new RegExp(options.paginationFilter.regexp, 'i');
        const prop = options.paginationFilter.property;
        return objects.filter(object => {
          return regexp.test(object[prop][0]);
        });
      }
    }

    // no string filter, but has limitTo filter turned on
    if (!filter && options.hasOwnProperty('limitTo')) {
      return objects.filter((object, index) => {
        return index <= +options.limitTo;
      });
    }

    // fuzzy filter using fuse.js
    if (options.hasOwnProperty('matchFuzzy')) {

      const fuseOptions = {
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [property]
      };
      const fuse = new Fuse(objects, fuseOptions);
      const result = fuse.search(filter);
      return result;

    }

    // for string filter
    return objects.filter(object => {
      if (options.matchAny) {
        return (object[property] ? object[property] : '').toString().toLowerCase().includes(filter.toString().toLowerCase());

      } else if (options.matchOptimistic) {
        try {
            if (object[property]) {
              const p = object[property].replace(/[^a-zA-Z0-9\\s]/gm, '').toLowerCase();
              const f = filter.replace(/[^a-zA-Z0-9\\s]/gm, '').toLowerCase();
              return p.includes(f);
            }

         } catch (RegexMatchTimeoutException) {
           console.log('optimistic search regex error');
            return false;
         }

      } else if (options.matchFuzzy) {
              const fuseOptions = {
                shouldSort: true,
                threshold: 0.6, // can lower threshold in tenth percent increments if too many results
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
                keys: [property]
              };

              const f = new Fuse([property + ': ' + object[property]], fuseOptions);
              const result = f.search(filter);
              return result.length > 0;

      } else {
        return (object[property] ? object[property] : '').substring(0, filter.length).toLowerCase() === filter.toLowerCase();
      }
    });
  }

}
