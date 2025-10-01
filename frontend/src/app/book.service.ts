import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Book } from './book';
import { User } from './user';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = '/api/books';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders() {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.getToken(),
    });
  }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl).pipe(
      tap((books: Book[]) => {
        books.forEach((book: Book) => {
          this.updateBookOwnerData(book);
        });
      }),
    );
  }

  updateBookOwnerData(book: Book) {
    this.http
      .get<User>(`/api/users/${book.username}`)
      .subscribe((userData: User) => {
        book.ownerAvatar = `/api/uploads/avatars/${book.username}_avatar.webp`;
        book.ownerName = userData.name || '';
      });
  }

  refreshBookOwners(books: Book[]) {
    books.forEach((book) => {
      this.updateBookOwnerData(book);
    });
  }

  addBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/create`, book, {
      headers: this.getHeaders(),
    });
  }

  updateBook(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/update/${id}`, book, {
      headers: this.getHeaders(),
    });
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, {
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
