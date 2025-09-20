package com.backend.bookshelves.controller;

import com.backend.bookshelves.model.User;
import com.backend.bookshelves.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        User registered = userService.register(user);
        return ResponseEntity.ok(registered);
    }
}