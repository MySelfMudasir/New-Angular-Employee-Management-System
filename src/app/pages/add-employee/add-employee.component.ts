import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { LayoutService } from '../../layout/service/layout.service';
import { ApiService } from '../../services/api.service';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import * as SimpleWebAuthnBrowser from '@simplewebauthn/browser';


@Component({
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule, FluidModule, ButtonModule, SelectModule, FormsModule, TextareaModule, AutoCompleteModule, ReactiveFormsModule, ToastModule,
        FileUploadModule,
    ],
    templateUrl: './add-employee.component.html',
    styleUrl: './add-employee.component.css',
    providers: [MessageService]
})
export class AddEmployeeComponent {
    states:any = undefined;
    roles:any = undefined;
    visible: boolean = false;
    uploadedFiles: any[] = [];
    CurrentRegisteredEmployeeId: any = '';
    loading: boolean = false;


    constructor(public router:Router, public layoutService: LayoutService, private messageService: MessageService) { }
    apiService = inject(ApiService);


    ngOnInit() {
        this.states = [
            {name: 'Arizona', code: 'Arizona'},
            {name: 'California', code: 'California'},
            {name: 'Florida', code: 'Florida'},
            {name: 'Ohio', code: 'Ohio'},
            {name: 'Washington', code: 'Washington'}
        ];
        this.roles = [
            {name: 'Super Admin', code: 'super_admin'},
            {name: 'Admin', code: 'admin'},
            {name: 'User', code: 'user'}
        ]
    }

    
    addEmployeeForm: FormGroup = new FormGroup({
        employeeid: new FormControl('123', [Validators.required]), // Same as
        username: new FormControl('abc', [Validators.required]), // Same as
        firstname: new FormControl('mudasir', [Validators.required]),
        lastname: new FormControl('maqbool', [Validators.required]),
        email: new FormControl('mudasir7777@gmail.com', [Validators.required]),
        phone: new FormControl('030000000', [Validators.required]),
        address: new FormControl('BWN', [Validators.required]),
        state: new FormControl('Arizona', [Validators.required]),
        city: new FormControl('BWN', [Validators.required]),
        zipcode: new FormControl('62300', [Validators.required]),
        role: new FormControl('user', [Validators.required]),
        passkey: new FormControl('', [Validators.required]),
    })



    onSubmit() {
        if (this.addEmployeeForm.valid) {
            if (this.uploadedFiles.length == 1) {
                console.log('Form Submitted', this.addEmployeeForm.value);
                this.addEmployee();
            } else if (this.uploadedFiles.length > 1) {
                console.log('Multiple files selected');
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Please upload only one file' });
            }
            else if(this.CurrentRegisteredEmployeeId == '') {
                console.log('Fingerprint Not Recognized');
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Fingerprint Not Recognized' });
            }
            else {
                console.log('No Profile Pic uploaded');
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Please upload a Profile Pic' });
            }
        } else {
            console.log('Form Invalid');
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Form Invalid' });
        }
    }
    



    onUpload(event: any) {
        console.log('File Uploaded:', event);
        for (const file of event.files) {
            this.uploadedFiles.push(file);
        }
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    }




    

    

    addEmployee() {
        const file = this.uploadedFiles[0];
        this.addEmployeeForm.patchValue({
            employeeid: this.CurrentRegisteredEmployeeId,
            username: this.addEmployeeForm.value.firstname +'.'+ this.addEmployeeForm.value.lastname,
        });
        console.log('Employee Data:', this.addEmployeeForm.value);
        this.apiService.addEmployee(this.addEmployeeForm.value, file).subscribe((response) => {
            console.log('Employee Added Successfully:', response);
            if (response.status == 201) {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Employee Added Successfully' });
                this.router.navigate(['/pages/view-employee']);
            }
        },
        (error) => {
            // Handle other server errors
            console.error('Error Adding Employee:', error);
            this.messageService.add({ severity: 'error', summary: 'Failed', detail:error.error.message });
        });
    }




    payload = {
        userId: 'Employee_Management_System',
        username: this.addEmployeeForm.value.username,
    };



    webAuthRegister(){
        
        this.addEmployeeForm.valueChanges.subscribe(values => {
            // console.log(values);
        });
          
        const temp = this.addEmployeeForm.value.firstname +'.'+ this.addEmployeeForm.value.lastname;
        this.addEmployeeForm.value.username=temp;
        this.payload.username = this.addEmployeeForm.value.username;

        this.loading = true;
        this.apiService.webAuthRegister(this.payload).subscribe((response: any) => {
        this.webAuthRegisterPasskey(response.id);
        });
    }

    
        
    webAuthRegisterPasskey(userId: string) {
        this.apiService.webAuthRegisterChallenge(userId).subscribe((response: any) => {
        console.log(response);
        const options = response.options;
        SimpleWebAuthnBrowser.startRegistration({ ...options }).then((authenticationResult: any) => {
            this.apiService.webAuthRegisterVerify(userId, authenticationResult).subscribe(result => {
            console.log(result);
            if(result.user.passkey.userVerified) {
                this.CurrentRegisteredEmployeeId = result.user.id;
                this.addEmployeeForm.patchValue({
                    passkey: { 'employeeid': this.CurrentRegisteredEmployeeId, ...result.user.passkey }
                })
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Fingerprint Recognized Successfully' });
                this.loading = false;
            }
            else {
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Fingerprint Not Recognized' });
                this.loading = false;
            }
            });
        }).catch(error => {
            console.log('Error:', error);
            this.loading = false;
            });
        });
    }
    






 }
