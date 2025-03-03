import { Component, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { ApiService } from '../../../services/api.service';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    template: `<div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Employees Statistics</div>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>`
})
export class RevenueStreamWidget {
    chartData: any;
    chartOptions: any;
    super_admin: number[] = [];
    admin: number[] = [];
    user: number[] = [];

    subscription!: Subscription;
    apiService = inject(ApiService);

    constructor(public layoutService: LayoutService) {
        this.initChart();
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart
        });
    }

    ngOnInit() {
        this.employeeStatistics();
        console.log('get data');
        setTimeout(() => {
            this.updateChart();
            console.log('update data');
        }, 3000);
        
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData = {
            labels: ['Super Admin', 'Admin', 'Employee'],
            datasets: [
                {
                    type: 'bar',
                    label: 'Total',
                    backgroundColor: '#8b5cf6',
                    data: [13,23,24],
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: 'Present',
                    backgroundColor: '#22C55E',
                    data: this.admin,
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: 'Leave',
                    backgroundColor: '#f43f5e',
                    data: this.user,
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false,
                    barThickness: 32
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }


    employeeStatistics() {

        this.apiService.getEmployeeStatistics().subscribe((response: any) => {
            console.log(response);
            this.super_admin.push(response.roleCounts.super_admin);
            this.admin.push(response.roleCounts.admin);
            this.user.push(response.roleCounts.user);
            
            // this.super_admin.push(10, 20);
            // this.admin.push(10, 20);
            // this.user.push(10, 20);

            console.log('Super Admin', this.super_admin);
            
            console.log('total attendence', response.totalAttendances);
            console.log('total employee', response.totalEmployees);
        });
    }


    updateChart() {
        this.chartData.datasets[0].data = this.super_admin;
        this.chartData.datasets[1].data = this.admin;
        this.chartData.datasets[2].data = this.user;
    }


}
