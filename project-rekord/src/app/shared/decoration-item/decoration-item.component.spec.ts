import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecorationItemComponent } from './decoration-item.component';

describe('DecorationItemComponent', () => {
  let component: DecorationItemComponent;
  let fixture: ComponentFixture<DecorationItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecorationItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecorationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
