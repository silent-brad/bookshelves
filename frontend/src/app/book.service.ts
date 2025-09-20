import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': 'Bearer ' + this.authService.getToken()
    });
  }

  getBooks(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  addBook(book: any): Observable<any> {
    return this.http.post(this.apiUrl, book, { headers: this.getHeaders() });
  }

  updateBook(id: number, book: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, book, { headers: this.getHeaders() });
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}