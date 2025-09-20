import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../book.service';

@Component({
  standalone: true,
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css'],
  imports: [CommonModule, FormsModule]
})
export class BookFormComponent implements OnInit {
  book: any = { title: '', author: '', status: '' };
  isEdit: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private bookService: BookService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.bookService.getBooks().subscribe((data: any) => {
        this.book = data;
      });
    }
  }

  onSubmit() {
    if (this.isEdit) {
      this.bookService.updateBook(this.book.id, this.book).subscribe(() => {
        this.router.navigate(['/books']);
      });
    } else {
      this.bookService.addBook(this.book).subscribe(() => {
        this.router.navigate(['/books']);
      });
    }
  }
}