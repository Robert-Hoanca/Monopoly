import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoatItemComponent } from './boat-item.component';

describe('BoatItemComponent', () => {
  let component: BoatItemComponent;
  let fixture: ComponentFixture<BoatItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoatItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoatItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
