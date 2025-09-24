import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Book } from './book';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://localhost:8000/api/books';

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
    return this.http.get(this.apiUrl);
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
