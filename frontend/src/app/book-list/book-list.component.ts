import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../book.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  imports: [CommonModule]
})
export class BookListComponent implements OnInit {
  books: any[] = [];

  constructor(private bookService: BookService, private router: Router) { }

  ngOnInit() {
    this.bookService.getBooks().subscribe(data => {
      this.books = data;
    });
  }

  addBook() {
    this.router.navigate(['/book-form']);
  }

  editBook(id: number) {
    this.router.navigate(['/book-form', id]);
  }

  deleteBook(id: number) {
    this.bookService.deleteBook(id).subscribe(() => {
      this.books = this.books.filter(book => book.id !== id);
    });
  }
}