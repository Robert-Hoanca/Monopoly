import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecorativeElementComponent } from './decorative-element.component';

describe('DecorativeElementComponent', () => {
  let component: DecorativeElementComponent;
  let fixture: ComponentFixture<DecorativeElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecorativeElementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecorativeElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
