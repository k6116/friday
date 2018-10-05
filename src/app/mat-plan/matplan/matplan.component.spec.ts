import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatplanComponent } from './matplan.component';

describe('MatplanComponent', () => {
  let component: MatplanComponent;
  let fixture: ComponentFixture<MatplanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatplanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
