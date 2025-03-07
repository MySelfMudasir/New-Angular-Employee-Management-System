import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../services/state.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const stateService = inject(StateService);


  const currentLoginUserDetails = stateService.getCurrentLoginUserDetails();
    
  if (currentLoginUserDetails && (currentLoginUserDetails.employeeRole === 'admin' || currentLoginUserDetails.employeeRole === 'super_admin')) {    
    console.log('You are authorized to view this page');
    return true; // Navigation is allowed
  } else {
    console.log('You are not authorized to view this page');
    router.navigate(['/auth/login']); // Redirect to login
    return false; // Prevent navigation
  }


};
