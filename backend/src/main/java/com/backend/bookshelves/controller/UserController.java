package com.backend.bookshelves.controller;

import com.backend.bookshelves.model.User;
import com.backend.bookshelves.model.Book;
import com.backend.bookshelves.service.BookService;
import com.backend.bookshelves.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BookService bookService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        User registered = userService.register(user);
        return ResponseEntity.ok(registered);
    }

    @GetMapping("/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.findByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{username}/books")
    public ResponseEntity<List<Book>> getUserBooks(@PathVariable String username) {
        User user = userService.findByUsername(username);
        if (user != null) {
            List<Book> books = bookService.getBooksByOwner(user);
            return ResponseEntity.ok(books);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/update/{username}")
    public ResponseEntity<User> updateUser(@PathVariable String username, @RequestBody User updatedUser) {
        User user = userService.findByUsername(username);
        if (user != null) {
            // Only allow updating name and description
            user.setName(updatedUser.getName());
            user.setDescription(updatedUser.getDescription());
            User savedUser = userService.save(user);
            return ResponseEntity.ok(savedUser);
        }
        return ResponseEntity.notFound().build();
    }
}