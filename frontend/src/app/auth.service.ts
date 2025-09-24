import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.jwt);
        localStorage.setItem('username', username);
        // Fetch user data to get name after login
        this.http.get(`http://localhost:8000/api/users/${username}`).subscribe((userData: any) => {
          localStorage.setItem('name', userData.name || '');
        });
      }),
    );
  }

  register(username: string, password: string, email: string, name?: string, description?: string): Observable<any> {
    return this.http.post('http://localhost:8000/api/users/register', {
      username,
      password,
      email,
      name,
      description
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
