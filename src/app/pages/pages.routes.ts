import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { ViewEmployeeComponent } from './view-employee/view-employee.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';
import { EmployeeAttendenceComponent } from './employee-attendence/employee-attendence.component';
import { adminAuthGuard } from '../guards/admin-auth.guard';
import { userAuthGuard } from '../guards/user-auth.guard';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'add-employee', component: AddEmployeeComponent, canActivate: [adminAuthGuard] },
    { path: 'view-employee', component: ViewEmployeeComponent, canActivate: [adminAuthGuard] },
    { path: 'edit-employee/:id', component: EditEmployeeComponent, canActivate: [adminAuthGuard]},
    { path: 'employee-attendence', component: EmployeeAttendenceComponent, canActivate: [userAuthGuard]},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
