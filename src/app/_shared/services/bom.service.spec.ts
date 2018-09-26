import { TestBed, inject } from '@angular/core/testing';

import { BomService } from './bom.service';

describe('BomService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BomService]
    });
  });

  it('should be created', inject([BomService], (service: BomService) => {
    expect(service).toBeTruthy();
  }));
});
