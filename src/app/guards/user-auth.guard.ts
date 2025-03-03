import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../services/state.service';

export const userAuthGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  const stateService = inject(StateService);


  const currentLoginUserDetails = stateService.getCurrentLoginUserDetails();
  

  if (currentLoginUserDetails.employeeRole === 'user') {
    return true; // Navigation is allowed
  } else {
    router.navigate(['/auth/login']); // Redirect to login
    return false; // Prevent navigation
  }



};
