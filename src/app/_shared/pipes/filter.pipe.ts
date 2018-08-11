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


    // return filtered, or non filtered array of objects depending on filter string and options

    // return all (or nothing) if no objects or no filter given
    if (!objects || !hasFilter) {
      console.log('no filter provided, returning all objects');
      return objects;
    }

    // no string filter, but has the pagination filter turned on
    if (!filter && options.hasOwnProperty('paginationFilter')) {
      if (options.paginationFilter.on) {
        const regexp = new RegExp(options.paginationFilter.regexp, 'i');
        const prop = options.paginationFilter.property;
        console.log('returning filtered objects by pagination');
        return objects.filter(object => {
          return regexp.test(object[prop][0]);
        });
      }
    }

    // no string filter, but has the limitTo filter turned on
    if (!filter && options.hasOwnProperty('limitTo')) {
      console.log(`returning limit to filter (${+options.limitTo}`);
      return objects.filter((object, index) => {
        return index < +options.limitTo;
      });
    }

    // fuzzy filter using fuse.js
    if (options.hasOwnProperty('matchFuzzy')) {
      if (options.matchFuzzy) {
        const t0 = performance.now();

        // set the threshold (sensitivity), either passed in the options, or the default of 0.4
        let threshold;
        if (options.hasOwnProperty('matchFuzzy.threshold')) {
          threshold = options.matchFuzzy.threshold;
        } else {
          threshold = 0.4;
        }

        const fuseOptions = {
          threshold: threshold,
          location: 0,
          distance: 100,
          maxPatternLength: 16,
          minMatchCharLength: 1,
          keys: [property]
        };
        const fuse = new Fuse(objects, fuseOptions);
        const result = fuse.search(filter);

        const t1 = performance.now();
        console.log(`returning fuzzy search filter; took ${t1 - t0} milliseconds`);

        return result;
      }
    }

    // matchOptimistic filter option
    if (options.hasOwnProperty('matchOptimistic')) {
      if (options.matchcOptimistic) {

        return objects.filter(object => {
          const p = object[property].replace(/[^a-zA-Z0-9\\s]/gm, '').toLowerCase();
          const f = filter.replace(/[^a-zA-Z0-9\\s]/gm, '').toLowerCase();
          return p.includes(f);
        });

      }
    }

    // match exact option
    if (options.hasOwnProperty('matchExact')) {
      if (options.matchExact) {

        console.log('returning from match exact filter');
        // must be an exact match - good for dropdown selections where you can guarantee an exact match
        // and don't want any extra matches (like NPIs)
        return objects.filter(object => {
          return object[property] === filter;
        });

      }
    }

    // default option (no options passed): do a trimmed, lowercase match
    return objects.filter(object => {
      return object[property].trim().toLowerCase() === filter.trim().toLowerCase();
    });



  }

}
