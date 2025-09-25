package com.backend.bookshelves.service;

import com.backend.bookshelves.model.Book;
import com.backend.bookshelves.model.User;
import com.backend.bookshelves.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id).orElse(null);
    }

    public Book saveBook(Book book) {
       if (book.getOwner() != null) {
         book.setUsername(book.getOwner().getUsername());
         book.setOwnerName(book.getOwner().getName() != null ? book.getOwner().getName() : book.getOwner().getUsername());
       }
       java.time.LocalDateTime now = java.time.LocalDateTime.now();
       if (book.getCreatedAt() == null) {
         book.setCreatedAt(now);
       }
       book.setUpdatedAt(now);
       return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    public List<Book> getBooksByOwner(User owner) {
        return bookRepository.findByOwner(owner);
    }

    public List<String> getAuthors() {
        return bookRepository.findDistinctAuthors();
    }

    public List<Book> getBooksByAuthor(String author) {
        return bookRepository.findByAuthor(author);
    }

    public void updateBookOwnerFields(User user) {
        List<Book> books = bookRepository.findByOwner(user);
        for (Book book : books) {
            book.setUsername(user.getUsername());
            book.setOwnerName(user.getName() != null ? user.getName() : user.getUsername());
            bookRepository.save(book);
        }
    }
}
