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

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {
    this.updateUsername();
  }

  updateUsername() {
    const storedUsername = localStorage.getItem('username');
    const storedName = localStorage.getItem('name');
    if (storedUsername) {
      this.username = storedUsername;
      this.name = storedName || '';
    } else {
      this.username = '';
      this.name = '';
    }
  }

  ngOnInit() {
    // Update username on component initialization
    this.updateUsername();
  }

  logout() {
    this.authService.logout();
    this.username = '';
    this.router.navigate(['/books']);
  }
}
