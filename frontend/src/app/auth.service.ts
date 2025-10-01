import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from './user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';

  private http = inject(HttpClient);

  login(username: string, password: string): Observable<{ jwt: string }> {
    return this.http
      .post<{ jwt: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response: { jwt: string }) => {
          localStorage.setItem('token', response.jwt);
          localStorage.setItem('username', username);
          // Fetch user data to get name after login
          this.http
            .get<User>(`/api/users/${username}`)
            .subscribe((userData: User) => {
              localStorage.setItem('name', userData.name || '');
              localStorage.setItem('username', username);
              localStorage.setItem(
                'avatar',
                userData.avatarUrl && userData.avatarUrl !== ''
                  ? userData.avatarUrl
                  : userData.name === ''
                    ? 'default-avatar.png'
                    : `https://ui-avatars.com/api/?background=random&name=${(userData.name || '').replace(' ', '+')}`,
              );
            });
        }),
      );
  }

  register(
    username: string,
    password: string,
    email: string,
    name?: string,
    description?: string,
  ): Observable<unknown> {
    return this.http
      .post('/api/users/register', {
        username,
        password,
        email,
        name,
        description,
      })
      .pipe(
        tap((response: unknown) => {
          localStorage.setItem('username', username);
          localStorage.setItem('name', name || '');
        }),
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}
