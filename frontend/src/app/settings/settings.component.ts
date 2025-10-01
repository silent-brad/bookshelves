import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { User } from '../user';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [FormsModule, CommonModule],
})
export class SettingsComponent implements OnInit {
  @ViewChild('deleteModal') deleteModalEl!: ElementRef;

  username = localStorage.getItem('username') || '';
  updatedName = '';
  updatedDescription = '';
  selectedFile: File | null = null;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  private http = inject(HttpClient);
  public authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.http.get<User>(`/api/users/${this.username}`).subscribe(
      (data: User) => {
        this.updatedName = data.name || '';
        this.updatedDescription = data.description || '';
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      },
    );
  }

  saveChanges() {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    const updatedUser = {
      name: this.updatedName,
      description: this.updatedDescription,
    };
    this.http
      .put<User>(`/api/users/update/${this.username}`, updatedUser, {
        headers: { Authorization: 'Bearer ' + this.authService.getToken() },
      })
      .subscribe(
        (response: User) => {
          localStorage.setItem('name', response.name || '');
          // Optionally show success message
        },
        (error) => {
          console.error('Error updating user profile:', error);
        },
      );
  }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    if (!this.authService.isLoggedIn()) {
      return;
    }
    const passwordData = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
    };
    this.http
      .put(`/api/users/change-password`, passwordData, {
        headers: { Authorization: 'Bearer ' + this.authService.getToken() },
      })
      .subscribe(
        () => {
          // Optionally show success message
          this.oldPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },
        (error) => {
          console.error('Error changing password:', error);
        },
      );
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target?.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
    }
  }

  uploadAvatar() {
    if (!this.selectedFile || !this.authService.isLoggedIn()) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http
      .post(`/api/users/${this.username}/avatar`, formData, {
        headers: { Authorization: 'Bearer ' + this.authService.getToken() },
        responseType: 'text',
      })
      .subscribe(
        () => {
          this.selectedFile = null;
        },
        (error) => {
          console.error('Error uploading avatar:', error);
        },
      );
  }

  goBack() {
    this.router.navigate(['/user', this.username]);
  }

  openDeleteModal() {
    this.deleteModalEl.nativeElement.showModal();
  }

  closeDeleteModal() {
    this.deleteModalEl.nativeElement.close();
  }

  confirmDelete() {
    this.http
      .delete('/api/users/delete', {
        headers: { Authorization: 'Bearer ' + this.authService.getToken() },
        responseType: 'text',
      })
      .subscribe(
        () => {
          this.authService.logout();
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error deleting account:', error);
        },
      );
    this.closeDeleteModal();
  }
}
