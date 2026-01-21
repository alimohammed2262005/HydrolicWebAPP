import { Component, OnInit, OnDestroy } from '@angular/core';
import { Projectinterface } from '../../Interfaces/projectinterface';
import { Environment } from '../../Environment/environment';
import { ProjectServices } from '../../Services/project-services';
import { ActivatedRoute, Router } from '@angular/router';
import { Spinner } from "../spinner/spinner";
import { CommonModule } from '@angular/common';
import { Roles } from '../../Services/roles';
import { ProjectImagesStatus } from '../../Services/SubComponents/project-images-status';
import { ProjectImagesService } from '../../Services/project-images-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-project-images',
  imports: [Spinner, CommonModule],
  templateUrl: './admin-project-images.html',
  styleUrls: ['./admin-project-images.css'],
})
export class AdminProjectImages implements OnInit, OnDestroy {
  loading: boolean = false;
  projects: Projectinterface[] = [];
  hasDeletedImages = false;
  apiMessage: string = '';
  apiMessageType: 'success' | 'error' = 'success';
  environment = Environment.StaticFiles;
  private deletedImagesSubscription?: Subscription;

  constructor(
    private projectService: ProjectServices,
    private router: Router,
    private projectImagesService: ProjectImagesService,
    private routing: ActivatedRoute,
    private projectImagesStatus: ProjectImagesStatus,
    private roles: Roles,
  ) {}

  ngOnInit(): void {
    this.getAllProjects();
    this.checkDeletedImages();
    
    this.deletedImagesSubscription = this.projectImagesStatus.deletedprojectImages$.subscribe(deletedImages => {
      this.hasDeletedImages = deletedImages.length > 0;
    });
  }

  ngOnDestroy(): void {
    if (this.deletedImagesSubscription) {
      this.deletedImagesSubscription.unsubscribe();
    }
  }

  getAllProjects() {
    this.loading = true;
    this.projectService.getallprojects().subscribe({
      next: (res) => {
        this.projects = res;
        this.loading = false;
      },
      error: () => {
        this.projects = [];
        this.loading = false;
      }
    });
  }

  checkDeletedImages() {
    this.projectImagesService.getAllDeletedProjectImages().subscribe({
      next: deleted => {
        this.projectImagesStatus.setDeletedProjectsImages(deleted);
      },
      error: () => {
        this.projectImagesStatus.setDeletedProjectsImages([]);
      }
    });
  }

  viewProjectImages(projectId: number) {
    this.router.navigate(['/projectimages', projectId]);
  }

  addImage() {
    this.router.navigate(['addprojectimage']);
  }

  restoreDeletedImages() {
    this.router.navigate(['getdeletedprojectimages']);
  }

  get isAdmin() {
    return this.roles.isAdmin();
  }

  get isAuth() {
    return this.roles.isAuthenticated();
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.apiMessage = message;
    this.apiMessageType = type;
    setTimeout(() => this.apiMessage = '', type === 'success' ? 2000 : 5000);
  }
}
