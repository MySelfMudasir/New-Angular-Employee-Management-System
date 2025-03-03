import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  private apiUrl = `${environment.apiUrl}`;
  private apiUrl2 = 'http://localhost:3000';


  addUser(data: any): Observable<any> {
    console.log('Data Recevied In Service:', data);
    return this.http.post<any>(`${this.apiUrl}/users/add-user`, data);
  } 


  validateUser(data: any): Observable<any> {
    console.log('Data Recevied In Service:', data);
    return this.http.post<any>(`${this.apiUrl}/users/validate-user`, data);
  }

  addEmployee(data: any, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('employeeid', data.employeeid);
    formData.append('username', data.username);
    formData.append('firstname', data.firstname);
    formData.append('lastname', data.lastname);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    formData.append('state', data.state);
    formData.append('city', data.city);
    formData.append('zipcode', data.zipcode);
    formData.append('role', data.role);
    // Serialize the passkey object to a JSON string
    formData.append('passkey', JSON.stringify(data.passkey));
  
    if (file) {
      formData.append('image', file); // Append the image file
    }
    
    return this.http.post<any>(`${this.apiUrl}/employee/add-employee`, formData, {
      headers: { 'enctype': 'multipart/form-data' }
    });
  }


  viewEmployee(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/employee/view-employee`);
  }

  getEmployeeById(id: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/get-employee/${id}`);
  }

  updateEmployee(data: any, file: File, id: any): Observable<any> {
    const formData = new FormData();
    formData.append('firstname', data.firstname);
    formData.append('lastname', data.lastname);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    formData.append('state', data.state);
    formData.append('city', data.city);
    formData.append('zipcode', data.zipcode);
    formData.append('role', data.role);
    if (file) {
        formData.append('image', file); // Append the image file
    }
    return this.http.put<any>(`${this.apiUrl}/employee/update-employee/${id}`, formData);
  }

  deleteEmployee(id: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/employee/delete-employee/${id}`);
  }




  employeeAttendence(data: any): Observable<any> {    
    return this.http.post<any>(`${this.apiUrl}/employee/attendence`, data)
  }



  getEmployeeStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employee/statistics`);
  }


// ===============================================================================================================
                                                // WebAuthn API
// ===============================================================================================================
  webAuthRegister(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl2}/register`, payload);
  }

  webAuthRegisterChallenge(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl2}/register-challenge`, { userId });
  }

  webAuthRegisterVerify(userId: string, cred: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl2}/register-verify`, { userId, cred });
  }

  webAuthLoginChallenge(userId: string): Observable<any> {    
    return this.http.post<any>(`${this.apiUrl2}/login-challenge`, { userId });
  }

  webAuthLoginVerify(userId: string, cred: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl2}/login-verify`, { userId, cred });
  }
// ===============================================================================================================
                                                // WebAuthn API
// ===============================================================================================================

}
