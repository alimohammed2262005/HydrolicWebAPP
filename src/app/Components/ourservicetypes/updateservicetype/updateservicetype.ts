import { Component, OnInit } from '@angular/core';
import { Servicetypes } from '../../../Services/servicetypes';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Serviceinterface } from '../../../Interfaces/serviceinterface';
import { ServiceServices } from '../../../Services/service-services';

@Component({
  selector: 'app-updateservicetype',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './updateservicetype.html',
  styleUrls: ['./updateservicetype.css'],
})
export class UpdateServicetype implements OnInit {
  serviceForm!: FormGroup;
  serviceId: number | null = null;
  selectedFile: File | null = null;

  ourServicesList: Serviceinterface[] = []; 

  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private serviceTypeService: Servicetypes,
    private ourServicesService: ServiceServices,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    this.serviceForm = new FormGroup({
      serviceName: new FormControl(''), 
      description: new FormControl(''),
      image: new FormControl(null),
      serviceTypeName:new FormControl('')
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
    if (!this.serviceId) return;

    const formData = new FormData();

    if (this.serviceForm.value.serviceName) formData.append('ServiceId', this.serviceForm.value.serviceName);
    if (this.serviceForm.value.description) formData.append('Description', this.serviceForm.value.description);
    if (this.serviceForm.value.serviceTypeName) formData.append('ServiceTypeName', this.serviceForm.value.serviceTypeName);
    if (this.selectedFile) formData.append('Image', this.selectedFile, this.selectedFile.name);

    if (formData.keys().next().done) {
      this.showMessage('لم يتم تعديل أي حقل', 'error');
      return;
    }

    this.serviceTypeService.updateservicetypebyid(this.serviceId, formData).subscribe({
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
  get servicetypename() { return this.serviceForm.get('serviceTypeName'); }
  get image() { return this.serviceForm.get('image'); }
}
