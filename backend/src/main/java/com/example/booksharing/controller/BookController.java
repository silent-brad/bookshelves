package com.example.booksharing.controller;

import com.example.booksharing.model.Book;
import com.example.booksharing.model.User;
import com.example.booksharing.service.BookService;
import com.example.booksharing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User owner = userService.findByUsername(username);
        book.setOwner(owner);
        Book saved = bookService.saveBook(book);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        return book != null ? ResponseEntity.ok(book) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        Book book = bookService.getBookById(id);
        if (book == null) return ResponseEntity.notFound().build();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        if (!book.getOwner().getUsername().equals(username)) {
            return ResponseEntity.status(403).build();
        }

        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setStatus(bookDetails.getStatus());
        Book updated = bookService.saveBook(book);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        if (book == null) return ResponseEntity.notFound().build();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        if (!book.getOwner().getUsername().equals(username)) {
            return ResponseEntity.status(403).build();
        }

        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}