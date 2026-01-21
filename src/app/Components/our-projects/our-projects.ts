import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectServices } from '../../Services/project-services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Projectinterface } from '../../Interfaces/projectinterface';
import { Spinner } from "../spinner/spinner";
import { Environment } from '../../Environment/environment';
import { Roles } from '../../Services/roles';
import { Projectstatus } from '../../Services/SubComponents/projectstatus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-our-projects',
  imports: [CommonModule, FormsModule, Spinner],
  standalone: true,
  templateUrl: './our-projects.html',
  styleUrls: ['./our-projects.css']
})
export class OurProjects implements OnInit, OnDestroy {
  loading = false;
  projects: Projectinterface[] = [];
  hasDeletedProjects = false;
  apiMessage = '';
  apiMessageType: 'success' | 'error' = 'success';
  environment = Environment.StaticFiles;
  private deletedProjectsSubscription?: Subscription;

  constructor(
    private projectService: ProjectServices,
    private routing: ActivatedRoute,
    private router: Router,
    private roles: Roles,
    private projectStatus: Projectstatus
  ) {}

  ngOnInit(): void {
    this.getAllProjects();
    this.checkDeletedProjects();
    
    this.deletedProjectsSubscription = this.projectStatus.deletedprojects$.subscribe(res => {
      this.hasDeletedProjects = res.length > 0;
    });
  }

  ngOnDestroy(): void {
    if (this.deletedProjectsSubscription) {
      this.deletedProjectsSubscription.unsubscribe();
    }
  }

  getAllProjects() {
    this.loading = true;
    this.projectService.getallprojects().subscribe({
      next: res => {
        this.projects = res;
        this.loading = false;
      },
      error: () => {
        this.projects = [];
        this.loading = false;
      }
    });
  }

  checkDeletedProjects() {
    this.projectService.getalldeletedprojects().subscribe({
      next: deleted => {
        this.projectStatus.setDeletedProjects(deleted);
        this.hasDeletedProjects = deleted.length > 0;
      },
      error: () => {
        this.hasDeletedProjects = false;
      }
    });
  }

  deleteproject(id: number) {
    this.loading = true;
    this.projectService.deleteprojectbyid(id).subscribe({
      next: res => {
        this.showApiMessage(res, 'success');
        this.updateDeletedProjects();
        this.getAllProjects();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  restoredeletedprojects() {
    this.router.navigate(['restoredeletedprojects']);
  }

  private updateDeletedProjects() {
    this.projectService.getalldeletedprojects().subscribe({
      next: deleted => {
        this.projectStatus.setDeletedProjects(deleted);
        this.hasDeletedProjects = deleted.length > 0;
      },
      error: () => {
        this.hasDeletedProjects = false;
      }
    });
  }

  deletedprojectbyid(id: number) {
    this.deleteproject(id);
  }

  addproject() {
    this.router.navigate(['addproject']);
  }

  updateproject(id: number) {
    this.router.navigate(['updateproject', id]);
  }

  get isAdmin() {
    return this.roles.isAdmin();
  }

  get isAuth() {
    return this.roles.isAuthenticated();
  }

  private showApiMessage(message: string, type: 'success' | 'error') {
    this.apiMessage = message;
    this.apiMessageType = type;
    setTimeout(() => this.apiMessage = '', 2000);
  }
}
