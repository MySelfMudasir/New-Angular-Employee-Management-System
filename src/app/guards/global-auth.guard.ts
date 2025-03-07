import { CanActivateFn } from '@angular/router';

export const globalAuthGuard: CanActivateFn = (route, state) => {
  return true;
};
