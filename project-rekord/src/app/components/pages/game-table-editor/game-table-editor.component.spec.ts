import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTableEditorComponent } from './game-table-editor.component';

describe('GameTableEditorComponent', () => {
  let component: GameTableEditorComponent;
  let fixture: ComponentFixture<GameTableEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameTableEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameTableEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
