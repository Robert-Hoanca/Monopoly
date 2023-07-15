import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RainDropsItemComponent } from './rain-drops-item.component';

describe('RainDropsItemComponent', () => {
  let component: RainDropsItemComponent;
  let fixture: ComponentFixture<RainDropsItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RainDropsItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RainDropsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
