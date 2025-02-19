import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { ViewEmployeeComponent } from './view-employee/view-employee.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';
import { EmployeeAttendenceComponent } from './employee-attendence/employee-attendence.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'add-employee', component: AddEmployeeComponent},
    { path: 'view-employee', component: ViewEmployeeComponent},
    { path: 'edit-employee/:id', component: EditEmployeeComponent},
    { path: 'employee-attendence', component: EmployeeAttendenceComponent},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
