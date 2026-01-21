import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServiceServices } from '../../Services/service-services';
import { ActivatedRoute, Router } from '@angular/router';
import { Environment } from '../../Environment/environment';
import { Serviceinterface } from '../../Interfaces/serviceinterface';
import { CommonModule } from '@angular/common';
import { Roles } from '../../Services/roles';
import { Spinner } from "../spinner/spinner";
import { Servicestatus } from '../../Services/SubComponents/servicestatus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ourservices',
  standalone: true,
  imports: [CommonModule, Spinner],
  templateUrl: './ourservices.html',
  styleUrls: ['./ourservices.css'],
})
export class Ourservices implements OnInit, OnDestroy {
  loading = false;
  services: Serviceinterface[] = [];
  hasDeletedServices = false;
  apiMessage = '';
  apiMessageType: 'success' | 'error' = 'success';
  environment = Environment.StaticFiles;
  private deletedServicesSubscription?: Subscription;

  constructor(
    private serviceServices: ServiceServices,
    private routing: ActivatedRoute,
    private router: Router,
    private roles: Roles,
    private serviceStatus: Servicestatus
  ) {}

  ngOnInit(): void {
    this.getAllServices();
    this.checkDeletedServices();
    
    this.deletedServicesSubscription = this.serviceStatus.deletedServices$.subscribe(deletedServices => {
      this.hasDeletedServices = deletedServices.length > 0;
    });
  }

  ngOnDestroy(): void {
    if (this.deletedServicesSubscription) {
      this.deletedServicesSubscription.unsubscribe();
    }
  }

  getAllServices() {
    this.loading = true;
    this.serviceServices.getallservices().subscribe({
      next: res => {
        this.services = res;
        this.loading = false;
      },
      error: () => {
        this.services = [];
        this.loading = false;
      }
    });
  }

  checkDeletedServices() {
    this.serviceServices.getalldeletedservices().subscribe({
      next: deleted => {
        this.serviceStatus.setDeletedServices(deleted);
      },
      error: () => {
        this.serviceStatus.setDeletedServices([]);
      }
    });
  }

  deleteservice(id: number) {
    this.loading = true;
    this.serviceServices.deleteservicebyid(id).subscribe({
      next: res => {
        this.checkDeletedServices();
        this.getAllServices();
        this.showApiMessage(res, 'success');
        this.loading = false;
      },
      error: err => {
        this.showApiMessage(err.error || 'حدث خطأ', 'error', 5000);
        this.loading = false;
      }
    });
  }

  addservice() {
    this.router.navigate(['addservice']);
  }

  updateservice(id: number) {
    this.router.navigate(['updateservice', id]);
  }

  deletedservicebyid(id: number) {
    this.deleteservice(id);
  }

  restoredeletedservices() {
    this.router.navigate(['restoredeletedservices']);
  }

  get isAdmin() {
    return this.roles.isAdmin();
  }

  get isAuth() {
    return this.roles.isAuthenticated();
  }

  private showApiMessage(message: string, type: 'success' | 'error', timeout: number = 2000) {
    this.apiMessage = message;
    this.apiMessageType = type;
    setTimeout(() => this.apiMessage = '', timeout);
  }
}
