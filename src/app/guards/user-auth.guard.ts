import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StateService } from '../services/state.service';

export const userAuthGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  const stateService = inject(StateService);


  const currentLoginUserDetails = stateService.getCurrentLoginUserDetails();
  console.log(currentLoginUserDetails.employeeRole);
  

  if (currentLoginUserDetails && (currentLoginUserDetails.employeeRole === 'user')) {    
    console.log('You are authorized to view this page');
    return true; // Navigation is allowed
  } else {
    console.log('You are not authorized to view this page');
    router.navigate(['/auth/login']); // Redirect to login
    return false; // Prevent navigation
  }



};
