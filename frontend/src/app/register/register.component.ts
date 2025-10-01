import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule],
})
export class RegisterComponent implements OnInit {
  username = '';
  email = '';
  password = '';
  name = '';
  description = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/books']);
    }
  }

  onRegister() {
    this.authService
      .register(
        this.username,
        this.password,
        this.email,
        this.name,
        this.description,
      )
      .subscribe(
        () => {
          this.authService.login(this.username, this.password).subscribe(() => {
            this.toast('Registration successful! Welcome!');
            this.router.navigate(['/books']);
          });
        },
        (err: any) => {
          // Provide better msg: example: Username already taken
          this.toastErr(err.error.message);
        },
      );
  }

  toastErr(message: string) {
    document.dispatchEvent(
      new CustomEvent('basecoat:toast', {
        detail: {
          config: {
            category: 'danger',
            title: 'Error',
            description: message,
            cancel: {
              label: 'Dismiss',
            },
          },
        },
      }),
    );
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
