import { TestBed } from '@angular/core/testing';

import { GamePhysicsService } from './game-physics.service';

describe('GamePhysicsService', () => {
  let service: GamePhysicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamePhysicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
