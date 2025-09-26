import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Book } from './book';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = '/api/books';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders() {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.getToken(),
    });
  }

  getBooks(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      tap((books: any) => {
        books.forEach((book: any) => {
          this.updateBookOwnerData(book);
        });
      }),
    );
  }

  updateBookOwnerData(book: any) {
    this.http.get(`/api/users/${book.username}`).subscribe((userData: any) => {
      book.ownerAvatar = `/api/uploads/avatars/${book.username}_avatar.webp`;
      book.ownerName = userData.name || '';
    });
  }

  refreshBookOwners(books: any[]) {
    books.forEach((book) => {
      this.updateBookOwnerData(book);
    });
  }

  addBook(book: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, book, {
      headers: this.getHeaders(),
    });
  }

  updateBook(id: number, book: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, book, {
      headers: this.getHeaders(),
    });
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getAuthors(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/authors`);
  }

  getBooksByAuthor(author: string): Observable<Book[]> {
    return this.http.get<Book[]>(
      `${this.apiUrl}/author/${encodeURIComponent(author)}`,
    );
  }
}
