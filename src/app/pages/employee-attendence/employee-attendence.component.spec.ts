import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAttendenceComponent } from './employee-attendence.component';

describe('EmployeeAttendenceComponent', () => {
  let component: EmployeeAttendenceComponent;
  let fixture: ComponentFixture<EmployeeAttendenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAttendenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAttendenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
