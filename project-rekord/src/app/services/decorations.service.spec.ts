import { TestBed } from '@angular/core/testing';

import { DecorationsService } from './decorations.service';

describe('DecorationsService', () => {
  let service: DecorationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecorationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
