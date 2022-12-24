import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerPropertiesComponent } from './player-properties.component';

describe('PlayerPropertiesComponent', () => {
  let component: PlayerPropertiesComponent;
  let fixture: ComponentFixture<PlayerPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
