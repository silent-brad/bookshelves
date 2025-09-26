import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.jwt);
        localStorage.setItem('username', username);
        // Fetch user data to get name after login
        this.http
          .get(`/api/users/${username}`)
          .subscribe((userData: any) => {
            localStorage.setItem('name', userData.name || '');
            localStorage.setItem('username', username);
            localStorage.setItem(
              'avatar',
              userData.avatarUrl && userData.avatarUrl !== ''
                ? userData.avatarUrl
                : userData.name === ''
                  ? 'default-avatar.png'
                  : `https://ui-avatars.com/api/?background=random&name=${userData.name.replace(' ', '+')}`
            );
          });
      })
    );
  }

  register(
    username: string,
    password: string,
    email: string,
    name?: string,
    description?: string
  ): Observable<any> {
    return this.http.post('/api/users/register', {
      username,
      password,
      email,
      name,
      description,
    }).pipe(
      tap((response: any) => {
        localStorage.setItem('username', username);
        localStorage.setItem('name', name || '');
        localStorage.setItem('avatar', `http://localhost:8000/uploads/avatars/${username}_avatar.webp`);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('avatar');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
