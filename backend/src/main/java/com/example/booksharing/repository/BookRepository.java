package com.example.booksharing.repository;

import com.example.booksharing.model.Book;
import com.example.booksharing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByOwner(User owner);
}