import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  
  constructor(private http: HttpClient) { }

  private CurrentLoginUserDetails = new BehaviorSubject<string>('');
  accountTitle$ = this.CurrentLoginUserDetails.asObservable();

  setCurrentLoginUserDetails(CurrentLoginUserPayload: object) {
    localStorage.setItem('CurrentLoginUserDetails', JSON.stringify(CurrentLoginUserPayload));
  }

  getCurrentLoginUserDetails() {
    const CurrentLoginUserDetails = localStorage.getItem('CurrentLoginUserDetails') || '';
    const currentLoginUserDetails = JSON.parse(CurrentLoginUserDetails);
    return currentLoginUserDetails;
  }


}
