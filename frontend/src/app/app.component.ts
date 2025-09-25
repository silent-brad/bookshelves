import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'frontend';
  username: string = '';
  name: string = '';
  avatar: string = '';
  currentYear: number = new Date().getFullYear();

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {
    this.updateUserInfo();
  }

  updateUserInfo() {
    const storedUsername = localStorage.getItem('username');
    const storedName = localStorage.getItem('name');
    if (storedUsername) {
      this.username = storedUsername || '';
      this.name = storedName || '';
      this.avatar = `https://localhost:8000/uploads/avatars/${this.username}_avatar.webp`;
    } else {
      this.username = '';
      this.name = '';
      this.avatar = '';
    }
  }

  ngOnInit() {
    this.updateUserInfo();
    // Subscribe to route changes or listen for login events
    this.router.events.subscribe(() => {
      this.updateUserInfo();
    });
  }

  logout() {
    this.authService.logout();
    this.username = '';
    this.name = '';
    this.avatar = '';
    this.router.navigate(['/books']);
  }
}
