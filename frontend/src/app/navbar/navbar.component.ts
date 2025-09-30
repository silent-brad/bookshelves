import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  username = '';
  name = '';

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
    } else {
      this.username = '';
      this.name = '';
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
    this.router.navigate(['/books']);
  }
}
