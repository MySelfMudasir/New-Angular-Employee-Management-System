import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from '../../layout/service/layout.service';
import { ApiService } from '../../services/api.service';
import { ButtonModule } from 'primeng/button';
import * as SimpleWebAuthnBrowser from '@simplewebauthn/browser';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        AutoCompleteModule, CalendarModule, DropdownModule, InputMaskModule, InputNumberModule, CascadeSelectModule, MultiSelectModule,
        InputTextModule,ReactiveFormsModule,
        ToastModule, ButtonModule,
        FileUploadModule,
    ],
    templateUrl: './employee-attendence.component.html',
    styleUrl: './employee-attendence.component.scss',
    providers: [MessageService]
})
export class EmployeeAttendenceComponent {
    private timer: any;
    private timerSuccesss: any;
    employeeId: any;
    username: any;
    email: any; 
    role: any; 
    employeeAttendenceForm:any;
    biomarticVarificationCheckout: boolean = false;
    CurrentLoginUserDetails: any;


    constructor(public router:Router, public layoutService: LayoutService, private messageService: MessageService) { }
    apiService = inject(ApiService);




      
    ngOnInit(): void { 
      this.addEventListeners();
      this.CurrentLoginUserDetails = JSON.parse(localStorage.getItem('CurrentLoginUserDetails') || '{}');
      console.log(this.CurrentLoginUserDetails);
      this.employeeId = this.CurrentLoginUserDetails.employeeId;
      this.username = this.CurrentLoginUserDetails.employeeUsername;
      this.email = this.CurrentLoginUserDetails.employeeEmail;
      this.role = this.CurrentLoginUserDetails.employeeRole;

      this.employeeAttendenceForm = {
        employeeId: this.employeeId,
        username: this.username,
        email: this.email,
        role: this.role,
        biomarticVarificationCheckout: false,
      };
    }
  
    ngOnDestroy(): void {
      // Clean up event listeners to prevent memory leaks
      this.removeEventListeners();
    }
  
    private addEventListeners(): void {
      const body = document.querySelector('.center');
      body?.addEventListener('mousedown', this.onTouchstart.bind(this));
      body?.addEventListener('touchstart', this.onTouchstart.bind(this));
      body?.addEventListener('mouseup', this.onTouchEnd.bind(this));
      body?.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
  
    private removeEventListeners(): void {
      const body = document.querySelector('.center');
      body?.removeEventListener('mousedown', this.onTouchstart.bind(this));
      body?.removeEventListener('touchstart', this.onTouchstart.bind(this));
      body?.removeEventListener('mouseup', this.onTouchEnd.bind(this));
      body?.removeEventListener('touchend', this.onTouchEnd.bind(this));
    }
  
    private onTouchstart(): void {
      const fingerprint = document.querySelector('.fingerprint');
      if (fingerprint) {
        fingerprint.classList.add('active');  // Add the 'active' class
        setTimeout(() => {
          this.webAuthLogin();
        }, 1500);        
      }

    }
  
    onTouchEnd(): void {
      const fingerprint = document.querySelector('.fingerprint');
      fingerprint?.classList.remove('active');
      
      clearTimeout(this.timer);
    }
  
    private onSuccess(): void {
      const body = document.querySelector('.center');
      const fingerprint = document.querySelector('.fingerprint');
      const center = document.querySelector('.center');
      
      body?.removeEventListener('mousedown', this.onTouchstart.bind(this));
      body?.removeEventListener('touchstart', this.onTouchstart.bind(this));
  
      fingerprint?.classList.remove('active');
      center?.classList.add('success');
  
      clearTimeout(this.timerSuccesss);
  
      this.timerSuccesss = setTimeout(() => {
        body?.addEventListener('mousedown', this.onTouchstart.bind(this));
        body?.addEventListener('touchstart', this.onTouchstart.bind(this));
        center?.classList.remove('success');
      }, 3000);
    }
  
    
  


    onSubmit() {
      if (this.employeeAttendenceForm.biomarticVarificationCheckout == true) {
          console.log('Form Submitted');
            this.apiService.employeeAttendence(this.employeeAttendenceForm).subscribe((response) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message});
          },
          (error) => {
          console.log('Error:', error.error.message);
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: error.error.message});
        })
      } 
      else if (this.employeeAttendenceForm.biomarticVarificationCheckout == false) {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Biomartic Varification Failed' });
      }
      else {
        console.log('Form Invalid');
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Attendence Failed' });
      }
    }





    webAuthLogin() {
      this.apiService.webAuthLoginChallenge(this.employeeId).subscribe((response: any) => {
        console.log(response);
        const options = response.options;
        SimpleWebAuthnBrowser.startAuthentication(options).then(authenticationResult => {
          this.apiService.webAuthLoginVerify(this.employeeId, authenticationResult).subscribe(result => {
            console.log(result);
            if(result.user.passkey.userVerified) {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Fingerprint Recognized Successfully' });
              this.timer = setTimeout(this.onSuccess.bind(this), 0);
              this.employeeAttendenceForm.employeeid = result.user.employeeid;
              this.employeeAttendenceForm.biomarticVarificationCheckout = true;

            }
          });
        }).catch(error => {
          this.onTouchEnd();
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Fingerprint Not Recognized' });
        });
      },
      error => {
        console.log('Error:', error.error);
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: error.error.message });
      });
    }











 }
