import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../book.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-author-list',
  templateUrl: './author-list.component.html',
  imports: [CommonModule],
})
export class AuthorListComponent implements OnInit {
  authors: string[] = [];

  private bookService = inject(BookService);
  private router = inject(Router);

  ngOnInit(): void {
    this.bookService.getAuthors().subscribe((authors) => {
      this.authors = authors;
    });
  }

  navigateToAuthor(author: string): void {
    this.router.navigate(['/author', author]);
  }
}
