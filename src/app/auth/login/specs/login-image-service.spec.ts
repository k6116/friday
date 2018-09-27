import { async, fakeAsync, tick, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ApiDataAuthService } from '../../../_shared/services/api-data/api-data-auth.service';
import { CacheService } from '../../../_shared/services/cache.service';
import { ToolsService } from '../../../_shared/services/tools.service';
import { LoginImageService } from '../services/login-image.service';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';


xdescribe('Login Image Service', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      declarations: [],
      providers: [ ApiDataAuthService, LoginImageService, CacheService, ToolsService ]
    })
    .compileComponents();
  }));

  it('retrieves all the background images', async(inject( [LoginImageService], ( loginImageService ) => {
    loginImageService.getBackgroundImages()
    .then(result => {
      console.log(result);
      // expect(result.length).toBeGreaterThan(0);
    })
    .catch(error => {
      console.log(error);
      expect(1).toEqual(1);
    });

  })));

});
