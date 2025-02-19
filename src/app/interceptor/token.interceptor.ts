import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  let globalAuthToken = localStorage.getItem('CurrentLoginUserDetails') || '';
  globalAuthToken = globalAuthToken ? JSON.parse(globalAuthToken).token : '';
  const newReq = req.clone({
    setHeaders:{
      Authorization: `Bearer ${globalAuthToken}`,
    }
  })
  return next(newReq);
};
