import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { LayoutService } from '../../layout/service/layout.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-view-employee',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    RatingModule,
    ButtonModule,
    SliderModule,
    InputTextModule,
    ToggleButtonModule,
    RippleModule,
    MultiSelectModule,
    DropdownModule,
    ProgressBarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './view-employee.component.html',
  styleUrl: './view-employee.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class ViewEmployeeComponent {

  customers: any[] = [];

  loading: boolean = false;

  @ViewChild('filter') filter!: ElementRef;

  constructor(public router:Router, public layoutService: LayoutService, private messageService: MessageService, private confirmationService: ConfirmationService) { }
  apiService = inject(ApiService);


  ngOnInit() {

    this.getAllEmployee();      
  }





  getAllEmployee() {
    this.apiService.viewEmployee().subscribe(
    (response) => {
      console.log('Employee', response);
      this.customers = response.employees;
    },
    (error) => {
      console.error('Error server', error);
      this.messageService.add({severity:'error', summary: 'Failed', detail: error.error.message});
    });
  }




  editEmployee(id:any){
    console.log('Edit Employee ID:', id);
    this.router.navigate(['/pages/edit-employee', id]);
  }


  
  deleteEmployee(id:any){
    this.confirmationService.confirm({
      key: 'confirm1',
      message: 'Are you sure to perform this action?',
      accept: () => {
        console.log('Delete Employee ID:', id);
          this.apiService.deleteEmployee(id).subscribe((response) => {
          console.log('Delete Employee:', response);
          if(response.status == 200){
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Employee Deleted Successfully'});
            this.getAllEmployee();
          }
          else{
            this.messageService.add({severity:'error', summary: 'Failed', detail: 'Error Deleting Employee'});
          }
          },
          (error) => {
            console.error('Error server Deleting Employee:', error);
            this.messageService.add({severity:'error', summary: 'Failed', detail: 'Server Error'});
          }
        );
      },
      reject: () => {
          this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Employee Deleted Failed' });
      }
  });

  }



  
  confirm1() {
    this.confirmationService.confirm({
        key: 'confirm1',
        message: 'Are you sure to perform this action?'
    });
}


   


}
