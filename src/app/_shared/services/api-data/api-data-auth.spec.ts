import { async, fakeAsync, tick, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ApiDataAuthService } from './_index';
import { CacheService } from '../cache.service';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';


describe('API Data Auth Service', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      declarations: [],
      providers: [ ApiDataAuthService, CacheService ]
    })
    .compileComponents();
  }));

  it('retrieves all the background images', async(inject( [ApiDataAuthService], ( apiDataAuthService ) => {
    apiDataAuthService.getLoginBackgroundImages().subscribe(result => {
      expect(result.length).toBeGreaterThan(0);
    });

  })));

});
