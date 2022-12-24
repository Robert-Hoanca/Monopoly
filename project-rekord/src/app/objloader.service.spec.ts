import { TestBed } from '@angular/core/testing';

import { OBJLoaderService } from './objloader.service';

describe('OBJLoaderService', () => {
  let service: OBJLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OBJLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
