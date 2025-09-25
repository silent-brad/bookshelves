import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { BookService } from '../book.service';
import { AuthService } from '../auth.service';
import { BasecoatSelectComponent } from '../basecoat-select/basecoat-select.component';

@Component({
  standalone: true,
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  imports: [CommonModule, DatePipe, FormsModule, BasecoatSelectComponent],
})
export class BookListComponent implements OnInit {
  books: any[] = [];
  book: any = { title: '', author: '', status: '' };
  currentUsername: string = '';
  statusOptions = [
    { value: 'Unread', label: 'Unread' },
    { value: 'Reading', label: 'Reading' },
    { value: 'Read', label: 'Read' }
  ];
  @ViewChild('addBook') addBookEl!: ElementRef;

  constructor(
    private bookService: BookService,
    public authService: AuthService,
  ) {
    this.currentUsername = localStorage.getItem('username') || '';
  }

  ngOnInit() {
    this.bookService.getBooks().subscribe((data) => {
      this.books = data;
    });
  }

  openAddModal() {
    this.addBookEl.nativeElement.showModal();
  }

  closeAddModal() {
    this.addBookEl.nativeElement.close();
  }

  addBook() {
    this.bookService.addBook(this.book).subscribe((res: any) => {
      this.books = [...this.books, res];
      this.addBookEl.nativeElement.close();
      this.book = { title: '', author: '', status: '' };
    });
  }

  editBook(id: number) {}

  deleteBook(id: number) {
    this.bookService.deleteBook(id).subscribe(() => {
      this.books = this.books.filter((book) => book.id !== id);
    });
  }
}
