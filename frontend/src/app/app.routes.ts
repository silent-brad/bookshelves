import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BookListComponent } from './book-list/book-list.component';
import { BookFormComponent } from './book-form/book-form.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'book/:id', component: BookDetailComponent },
  { path: 'user/:username', component: UserProfileComponent },
  { path: 'book-form', component: BookFormComponent, canActivate: [AuthGuard] },
  {
    path: 'book-form/:id',
    component: BookFormComponent,
    canActivate: [AuthGuard],
  },
  { path: '', component: BookListComponent },
  { path: '**', redirectTo: '' },
];
