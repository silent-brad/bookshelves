import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  standalone: true,
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  imports: [CommonModule, FormsModule, DatePipe],
})
export class UserProfileComponent implements OnInit {
  username: string = '';
  user: User | null = null;
  isEditing: boolean = false;
  updatedName: string = '';
  updatedDescription: string = '';
  selectedFile: File | null = null;
  books: any[] = [];
  readCount: number = 0;
  readingCount: number = 0;
  unreadCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.username = params['username'];
      this.loadUserProfile();
    });
  }

  loadUserProfile() {
    this.http
      .get<User>(`/api/users/${this.username}`)
      .subscribe(
        (data) => {
          this.user = data;
          this.updatedName = this.user?.name || '';
          this.updatedDescription = this.user?.description || '';
          this.loadUserBooks();
        },
        (error) => {
          console.error('Error fetching user profile:', error);
          this.user = null;
        },
      );
  }

  loadUserBooks() {
    this.http
      .get(`/api/users/${this.username}/books`)
      .subscribe(
        (data: any) => {
          this.books = data;
          this.calculateStats();
        },
        (error) => {
          console.error('Error fetching user books:', error);
          this.books = [];
        },
      );
  }

  calculateStats() {
    if (this.books.length > 0) {
      this.readCount = this.books.filter(
        (book) => book.status === 'Read',
      ).length;
      this.readingCount = this.books.filter(
        (book) => book.status === 'Reading',
      ).length;
      this.unreadCount = this.books.filter(
        (book) => book.status === 'Unread',
      ).length;
    } else {
      this.readCount = 0;
      this.readingCount = 0;
      this.unreadCount = 0;
    }
  }

  isCurrentUser(): boolean {
    return (
      !!this.user && this.user.username === localStorage.getItem('username')
    );
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
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
      .put(
        `/api/users/update/${this.username}`,
        updatedUser,
        {
          headers: { Authorization: 'Bearer ' + this.authService.getToken() },
        },
      )
      .subscribe(
        (response: any) => {
          if (this.user) {
            this.user.name = response.name;
            this.user.description = response.description;
            localStorage.setItem('name', response.name || '');
            this.isEditing = false;
            // Update username in navbar if the logged-in user is updating their own profile
            if (localStorage.getItem('username') === this.username) {
              localStorage.setItem('username', this.username); // Already set, just for consistency
            }
          }
        },
        (error) => {
          console.error('Error updating user profile:', error);
        },
      );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadAvatar() {
    if (!this.selectedFile || !this.authService.isLoggedIn()) {
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http
      .post(
        `/api/users/${this.username}/avatar`,
        formData,
        {
          headers: { Authorization: 'Bearer ' + this.authService.getToken() },
          responseType: 'text',
        },
      )
      .subscribe(
        () => {
          this.selectedFile = null;
        },
        (error) => {
          console.error('Error uploading avatar:', error);
        },
      );
  }

  goToBooks() {
    this.router.navigate(['/books']);
  }
}
