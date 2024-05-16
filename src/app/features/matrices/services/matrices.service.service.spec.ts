import { TestBed } from '@angular/core/testing';

import { MatricesServiceService } from './matrices.service.service';

describe('MatricesServiceService', () => {
  let service: MatricesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatricesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
