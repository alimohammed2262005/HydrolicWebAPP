import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Environment } from '../../Environment/environment';
import { ProjectImagesInterface } from '../../Interfaces/project-images-interface';
import { ProjectImagesService } from '../../Services/project-images-service';
import { ProjectImagesStatus } from '../../Services/SubComponents/project-images-status';
import { Spinner } from "../spinner/spinner";
import { CommonModule } from '@angular/common';
import { Roles } from '../../Services/roles';

@Component({
  selector: 'app-projects-images',
  templateUrl: './projects-images.html',
  styleUrls: ['./projects-images.css'],
  imports: [Spinner, CommonModule]
})
export class ProjectsImages implements OnInit {
  loading = false;
  projectImages: ProjectImagesInterface[] = [];
  apiMessage = '';
  apiMessageType: 'success' | 'error' = 'success';
  environment = Environment.StaticFiles;

  constructor(
    private projectImagesService: ProjectImagesService,
    private routing: ActivatedRoute,
    private router: Router,
    private projectImagesStatus: ProjectImagesStatus,
    private roles: Roles,
    
  ) {}

  ngOnInit(): void {
    const projectId = +this.routing.snapshot.paramMap.get('id')!;
    this.loadProjectImages(projectId);
    this.projectImagesStatus.deletedprojectImages$.subscribe(res => {
    });
  }

  loadProjectImages(projectId: number) {
    this.loading = true;
    this.projectImagesService.getProjectImagesByProjectId(projectId).subscribe({
      next: res => {
        this.projectImages = res;
        this.loading = false;
      },
      error: () => {
        this.projectImages = [];
        this.loading = false;
      }
    });
  }

  deleteImage(id: number) {
    this.loading = true;
    this.projectImagesService.softDeleteProjectImageById(id).subscribe({
      next: res => {
        const projectId = +this.routing.snapshot.paramMap.get('id')!;
        this.loadProjectImages(projectId);
        this.showApiMessage(res, 'success');
        this.loading = false;
      },
      error: err => {
        this.showApiMessage(err.error || 'حدث خطأ', 'error');
        this.loading = false;
      }
    });
  }
  updateImage(id: number) {
    this.router.navigate(['updateprojectimage', id]);
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
