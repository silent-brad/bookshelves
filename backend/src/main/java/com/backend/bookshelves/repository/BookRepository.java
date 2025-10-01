package com.backend.bookshelves.repository;

import com.backend.bookshelves.model.Book;
import com.backend.bookshelves.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByOwner(User owner);

    void deleteByOwner(User owner);

    @Query("SELECT DISTINCT b.author FROM Book b")
    List<String> findDistinctAuthors();

    List<Book> findByAuthor(String author);
}
