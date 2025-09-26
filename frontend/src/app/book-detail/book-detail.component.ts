import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css'],
  imports: [CommonModule, DatePipe]
})
export class BookDetailComponent implements OnInit {
  bookId: string = '';
  book: any = null;
  currentUsername: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public authService: AuthService,
    private router: Router
  ) {
    this.currentUsername = localStorage.getItem('username') || '';
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.bookId = params['id'];
      this.loadBookDetail();
    });
  }

  loadBookDetail() {
    this.http.get(`/api/books/${this.bookId}`).subscribe(
      (data) => {
        this.book = data;
      },
      (error) => {
        console.error('Error fetching book details:', error);
        this.book = null;
      }
    );
  }

  editBook() {
    if (this.authService.isLoggedIn() && this.book && this.book.username === this.currentUsername) {
      this.router.navigate(['/book-form', this.bookId]);
    }
  }

  deleteBook() {
    if (this.authService.isLoggedIn() && this.book && this.book.username === this.currentUsername) {
      this.http.delete(`/api/books/${this.bookId}`, {
        headers: { 'Authorization': 'Bearer ' + this.authService.getToken() }
      }).subscribe(
        () => {
          this.router.navigate(['/books']);
        },
        (error) => {
          console.error('Error deleting book:', error);
        }
      );
    }
  }

  goToBooks() {
    this.router.navigate(['/books']);
  }

  goToUserProfile(username: string) {
    this.router.navigate(['/user', username]);
  }
}