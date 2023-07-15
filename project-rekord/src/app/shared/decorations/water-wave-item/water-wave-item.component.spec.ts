import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterWaveItemComponent } from './water-wave-item.component';

describe('WaterWaveItemComponent', () => {
  let component: WaterWaveItemComponent;
  let fixture: ComponentFixture<WaterWaveItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterWaveItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterWaveItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
