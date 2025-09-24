import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../book.service';
import { Book } from '../book';

@Component({
  selector: 'app-author-detail',
  templateUrl: './author-detail.component.html',
  imports: [CommonModule, RouterModule],
})
export class AuthorDetailComponent implements OnInit {
  author: string = '';
  books: Book[] = [];

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
  ) {}

  ngOnInit(): void {
    this.author = this.route.snapshot.paramMap.get('author') || '';
    this.bookService.getBooksByAuthor(this.author).subscribe((books) => {
      this.books = books;
    });
  }
}
