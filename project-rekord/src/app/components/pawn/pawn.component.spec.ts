import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PawnComponent } from './pawn.component';

describe('PawnComponent', () => {
  let component: PawnComponent;
  let fixture: ComponentFixture<PawnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PawnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PawnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
