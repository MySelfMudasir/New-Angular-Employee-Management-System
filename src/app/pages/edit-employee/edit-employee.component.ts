import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { ImageModule } from 'primeng/image';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule, FluidModule, ButtonModule, SelectModule, FormsModule, TextareaModule, AutoCompleteModule, ReactiveFormsModule, ToastModule,
        FileUploadModule, ImageModule
    ],
    templateUrl: './edit-employee.component.html',
    styleUrl: './edit-employee.component.scss',
    providers: [MessageService]
})
export class EditEmployeeComponent {
    states:any = undefined;
    roles:any = undefined;
    visible: boolean = false;
    image: any;
    uploadedFiles: any = [];


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

        const currentEmployeeId = this.router.url.split('/').pop();
        if (currentEmployeeId) {
          this.getEmployeeById(currentEmployeeId);
        }
        else{
            this.router.navigate(['/view-employee']);
        }
    }

    editEmployeeForm: FormGroup = new FormGroup({
        firstname: new FormControl(''),
        lastname: new FormControl(''),
        email: new FormControl(''),
        phone: new FormControl(''),
        address: new FormControl(''),
        state: new FormControl(''),
        city: new FormControl(''),
        zipcode: new FormControl(''),
        role: new FormControl('user'),
    })

    



    getEmployeeById(currentEmployeeId: string) {
        console.log('Fetching employee by id:', currentEmployeeId);
        
        this.apiService.getEmployeeById(currentEmployeeId).subscribe((response) => {
          console.log('Employee Data:', response);
          this.editEmployeeForm.patchValue(response.employee);
          this.image = `http://localhost:5000/${response.employee.image}`;
        }, (error) => {
          console.error('Error fetching employee:', error);
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Error fetching employee data' });
        });
    }



    onSubmit() {
        if(this.editEmployeeForm.valid) {
            console.log('Update Form', this.editEmployeeForm.value);
            const currentEmployeeId = this.router.url.split('/').pop();
            this.updateEmployee(currentEmployeeId);
        }
        else {
            console.log('Form Invalid');
        }
    }
    



    onUpload(event: any) {
        console.log('File Uploaded:', event);
        for (const file of event.files) {
            this.uploadedFiles = [];
            this.uploadedFiles.push(file);
        }
        if (event.files.length > 0) {
            this.uploadedFiles = event.files[0];
            this.image = URL.createObjectURL(this.uploadedFiles);
        }
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    }
    



    updateEmployee(currentEmployeeId: any) {
        const file = this.uploadedFiles;        
        this.apiService.updateEmployee(this.editEmployeeForm.value, file, currentEmployeeId).subscribe((response) => {
            console.log('Employee updated Response:', response);
            if (response.status == 200) {
                // Redirect to view-employee
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Employee Updated Successfully' });
                setTimeout(() => {
                  this.router.navigate(['/pages/view-employee']);
                }, 2000);
            }
        },
        (error) => {
            console.error('Error Updating Employee:', error);
            // Handle other server errors
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Server Error' });
            console.log('Server Error:', error);
        });
    }

 }
