import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { globalAuthGuard } from './global-auth.guard';

describe('globalAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => globalAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
