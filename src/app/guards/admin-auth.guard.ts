import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../services/state.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const stateService = inject(StateService);


  const currentLoginUserDetails = stateService.getCurrentLoginUserDetails();


  if (currentLoginUserDetails.employeeRole === 'admin') {
    return true; // Navigation is allowed
  } else {
    router.navigate(['/auth/login']); // Redirect to login
    return false; // Prevent navigation
  }


};
