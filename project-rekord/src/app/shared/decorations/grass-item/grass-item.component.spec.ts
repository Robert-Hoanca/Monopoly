import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrassItemComponent } from './grass-item.component';

describe('GrassItemComponent', () => {
  let component: GrassItemComponent;
  let fixture: ComponentFixture<GrassItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrassItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrassItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
