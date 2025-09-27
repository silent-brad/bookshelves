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
  currentUsername = '';
  statusOptions = [
    { value: 'Unread', label: 'Unread' },
    { value: 'Reading', label: 'Reading' },
    { value: 'Read', label: 'Read' },
  ];
  isLoading = true;
  isEditing = false;
  skeletonNum: number[] = [1, 2, 3, 4, 5];
  editBookId: number | null = null;
  shareableUrl = '';
  @ViewChild('editBook') editBookEl!: ElementRef;
  @ViewChild('shareBook') shareBookEl!: ElementRef;

  constructor(
    private bookService: BookService,
    public authService: AuthService,
  ) {
    this.currentUsername = localStorage.getItem('username') || '';
  }

  ngOnInit() {
    this.bookService.getBooks().subscribe((data) => {
      this.books = data;
      console.log(this.books);
      this.isLoading = false;
    });
  }

  refreshBookOwners() {
    this.bookService.refreshBookOwners(this.books);
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
    this.isEditing = false;
    this.book = { title: '', author: '', status: '' };
    this.editBookEl.nativeElement.showModal();
  }

  closeEditModal() {
    this.editBookEl.nativeElement.close();
  }

  closeShareModal() {
    this.shareBookEl.nativeElement.close();
  }

  addBook() {
    this.bookService.addBook(this.book).subscribe((res: any) => {
      this.books = [...this.books, res];
      this.editBookEl.nativeElement.close();
      this.book = { title: '', author: '', status: '' };
      this.toast(`Book ${res.title} updated successfully.`);
    });
  }

  openEditModal(id: number) {
    this.isEditing = true;
    this.editBookId = id;
    const bookToEdit = this.books.find((book) => book.id === id);
    if (bookToEdit) {
      this.book = {
        title: bookToEdit.title,
        author: bookToEdit.author,
        status: bookToEdit.status,
      };
      this.editBookEl.nativeElement.showModal();
    }
  }

  updateBook() {
    if (this.editBookId !== null) {
      this.bookService
        .updateBook(this.editBookId, this.book)
        .subscribe((res: any) => {
          this.books = this.books.map((book) =>
            book.id === this.editBookId ? res : book,
          );
          this.editBookEl.nativeElement.close();
          this.book = { title: '', author: '', status: '' };
          this.editBookId = null;
          this.isEditing = false;
          this.toast(`Book ${res.title} updated successfully.`);
        });
    }
  }

  submitForm() {
    if (this.isEditing) {
      this.updateBook();
    } else {
      this.addBook();
    }
  }

  editBook(id: number) {
    this.openEditModal(id);
  }

  openShareModal(id: number) {
    this.shareableUrl = `http://localhost:4200/book/${id}`;
    this.shareBookEl.nativeElement.showModal();
  }

  copyLink() {
    navigator.clipboard
      .writeText(this.shareableUrl)
      .then(() => {
        this.toast(`Link copied to clipboard.`);
        this.shareBookEl.nativeElement.close();
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        // Toast..?
      });
    this.shareableUrl = '';
  }

  deleteBook(id: number) {
    this.bookService.deleteBook(id).subscribe(() => {
      this.books = this.books.filter((book) => book.id !== id);
      this.toast(`Book deleted successfully.`);
    });
  }
}
