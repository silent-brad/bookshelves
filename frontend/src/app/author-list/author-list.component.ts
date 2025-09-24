import { Component, OnInit } from '@angular/core';
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

  constructor(
    private bookService: BookService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.bookService.getAuthors().subscribe((authors) => {
      this.authors = authors;
    });
  }

  navigateToAuthor(author: string): void {
    this.router.navigate(['/author', author]);
  }
}
