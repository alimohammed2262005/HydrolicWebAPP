import { Component, OnInit } from '@angular/core';
import { Servicetypes } from '../../../Services/servicetypes';
import { ServiceServices } from '../../../Services/service-services';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Serviceinterface } from '../../../Interfaces/serviceinterface';

@Component({
  selector: 'app-addservicetype',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './addservicetype.html',
  styleUrls: ['./addservicetype.css'],
})
export class AddServicetype implements OnInit {
  serviceForm!: FormGroup;
  selectedFile: File | null = null;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  ourServicesList: Serviceinterface[] = [];
  constructor(
    private serviceTypeService: Servicetypes,
    private ourServicesService: ServiceServices,
    private router: Router
  ) {
    this.serviceForm = new FormGroup({
      serviceName: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      servicetypename: new FormControl('', Validators.required),
      image: new FormControl(null, Validators.required)
    });
  }

  ngOnInit(): void {
    this.loadOurServices();
  }

  loadOurServices() {
    this.ourServicesService.getallservices().subscribe({
      next: (res) => {
        this.ourServicesList = res;
      },
      error: (err) => console.error('Error loading services:', err)
    });
  }
  onFileSelect(event: any) {
    this.selectedFile = event.target.files.length > 0 ? event.target.files[0] : null;
    this.serviceForm.get('image')!.setValue(this.selectedFile);
  }
  submit() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.showMessage('يرجى اختيار صورة للخدمة', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('ServiceId', this.serviceForm.value.serviceName);
    formData.append('Description', this.serviceForm.value.description);
    formData.append('ServiceTypeName', this.serviceForm.value.servicetypename);
    formData.append('Image', this.selectedFile, this.selectedFile.name);

    this.serviceTypeService.addservicetype(formData).subscribe({
      next: res => {
        this.showMessage(res, 'success');
        setTimeout(() => this.router.navigate(['/ourservicetypes']), 1000);
      },
      error: err => this.showMessage(err.error, 'error')
    });
  }
  private showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }
  get serviceName() { return this.serviceForm.get('serviceName'); }
  get description() { return this.serviceForm.get('description'); }
  get image() { return this.serviceForm.get('image'); }
  get servicetypename() { return this.serviceForm.get('servicetypename'); }
}