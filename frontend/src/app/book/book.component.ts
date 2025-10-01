import { Component, Input, ViewChild, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookService } from '../book.service';
import { AuthService } from '../auth.service';
import { BasecoatSelectComponent } from '../basecoat-select/basecoat-select.component';
import { Book } from '../book';

@Component({
  selector: 'app-book',
  imports: [CommonModule, FormsModule, BasecoatSelectComponent],
  templateUrl: './book.component.html',
  styleUrl: './book.component.css',
})
export class BookComponent {
  @Input() books!: Book[];
  @Input() book!: Book;
  statusOptions = [
    { value: 'Unread', label: 'Unread' },
    { value: 'Reading', label: 'Reading' },
    { value: 'Read', label: 'Read' },
  ];
  currentUsername = '';
  shareableUrl = '';
  @ViewChild('editBook') editBookEl!: ElementRef;
  @ViewChild('shareBook') shareBookEl!: ElementRef;
  @ViewChild('deleteBook') deleteBookEl!: ElementRef;

  public authService = inject(AuthService);
  public bookService = inject(BookService);

  constructor() {
    this.currentUsername = localStorage.getItem('username') || '';
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

  openEditModal() {
    this.editBookEl.nativeElement.showModal();
  }

  openDeleteModal() {
    this.deleteBookEl.nativeElement.showModal();
  }

  closeEditModal() {
    this.editBookEl.nativeElement.close();
  }

  closeShareModal() {
    this.shareBookEl.nativeElement.close();
  }

  closeDeleteModal() {
    this.deleteBookEl.nativeElement.close();
  }

  confirmDelete() {
    this.bookService.deleteBook(this.book.id!).subscribe(() => {
      this.toast(`Book deleted successfully.`);
      this.books = this.books.filter((b) => b.id !== this.book.id);
      this.closeDeleteModal();
    });
  }

  updateBook() {
    this.bookService
      .updateBook(this.book.id!, {
        title: this.book.title,
        author: this.book.author,
        status: this.book.status,
      })
      .subscribe( (res: Book) => {
        this.books = this.books.map((b) => (b.id === this.book.id ? res : b));
        this.editBookEl.nativeElement.close();
        this.toast(`Book ${res.title} updated successfully.`);
      });
  }

  editBook() {
    this.openEditModal();
  }

  deleteBook() {
    this.bookService.deleteBook(this.book.id!).subscribe(() => {
      this.books = this.books.filter((b) => b.id !== this.book.id);
      this.toast(`Book deleted successfully.`);
    });
  }

  openShareModal() {
    this.shareableUrl = `http://localhost:8080/book/${this.book.id}`;
    this.shareBookEl.nativeElement.showModal();
  }

  copyLink() {
    navigator.clipboard
      .writeText(this.shareableUrl)
      .then(() => {
        this.toast(`Link copied to clipboard.`);
        this.shareableUrl = '';
        this.shareBookEl.nativeElement.close();
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        // Toast..?
      });
  }
}
