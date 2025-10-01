import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../book.service';
import { AuthService } from '../auth.service';
import { BasecoatSelectComponent } from '../basecoat-select/basecoat-select.component';
import { BookComponent } from '../book/book.component';

@Component({
  standalone: true,
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  imports: [CommonModule, FormsModule, BookComponent, BasecoatSelectComponent],
})
export class BookListComponent implements OnInit {
  // Add book type here
  books: any[] = [];
  newBook: any = { title: '', author: '', status: '' };
  currentUsername = '';
  statusOptions = [
    { value: 'Unread', label: 'Unread' },
    { value: 'Reading', label: 'Reading' },
    { value: 'Read', label: 'Read' },
  ];
  isLoading = true;
  skeletonNum: number[] = [1, 2, 3, 4, 5];
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
      this.isLoading = false;
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

  openAddModal() {
    this.newBook = { title: '', author: '', status: '' };
    this.addBookEl.nativeElement.showModal();
  }

  submitAddBook() {
    this.bookService.addBook(this.newBook).subscribe((res: any) => {
      this.books = [...this.books, res];
      this.addBookEl.nativeElement.close();
      this.newBook = { title: '', author: '', status: '' };
      this.toast(`Book ${res.title} updated successfully.`);
    });
  }

  closeAddModal() {
    this.newBook = { title: '', author: '', status: '' };
    this.addBookEl.nativeElement.close();
  }
}
