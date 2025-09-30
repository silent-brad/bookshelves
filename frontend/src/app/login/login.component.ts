import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule],
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/books']);
    }
  }

  onLogin() {
    this.authService
      .login(this.username, this.password)
      // Check if login is successful
      .subscribe((res: any) => {
        this.toast('Login successful! Welcome back!');
        this.router.navigate(['/books']);
      });
  }

  toast(message: string) {
    document.dispatchEvent(
      new CustomEvent('basecoat:toast', {
        detail: {
          config: {
            category: 'success',
            title: 'Success',
            description: message,
            cancel: {
              label: 'Dismiss',
            },
          },
        },
      }),
    );
  }
}
