package com.backend.bookshelves.repository;

import com.backend.bookshelves.model.Book;
import com.backend.bookshelves.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByOwner(User owner);
}