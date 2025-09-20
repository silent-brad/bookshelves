import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BookListComponent } from './book-list/book-list.component';
import { BookFormComponent } from './book-form/book-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'books', component: BookListComponent },
  { path: 'book-form', component: BookFormComponent },
  { path: '', redirectTo: '/books', pathMatch: 'full' },
  { path: '**', redirectTo: '/books' },
];
