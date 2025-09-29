import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BookListComponent } from './book-list/book-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AuthorListComponent } from './author-list/author-list.component';
import { AuthorDetailComponent } from './author-detail/author-detail.component';
import { IndexComponent } from './index/index.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'books', component: BookListComponent },
  { path: 'book/:id', component: BookDetailComponent },
  { path: 'user/:username', component: UserProfileComponent },
  { path: 'authors', component: AuthorListComponent },
  {
    path: 'author/:author',
    component: AuthorDetailComponent,
    //canActivate: [AuthGuard],
  },
  { path: '', component: IndexComponent },
  { path: '**', component: PageNotFoundComponent }
];
