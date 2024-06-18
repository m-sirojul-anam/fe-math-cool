import { TestBed } from '@angular/core/testing';

import { NumberToFractionService } from './number-to-fraction.service';

describe('NumberToFractionService', () => {
  let service: NumberToFractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NumberToFractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
