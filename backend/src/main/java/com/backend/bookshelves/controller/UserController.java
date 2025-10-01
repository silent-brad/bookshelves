package com.backend.bookshelves.controller;

import com.backend.bookshelves.model.User;
import com.backend.bookshelves.model.RegisterRequest;
import com.backend.bookshelves.model.Book;
import com.backend.bookshelves.service.BookService;
import com.backend.bookshelves.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BookService bookService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        System.out.println("Received user for registration: " + request.getUsername() + ", Password: " + (request.getPassword() != null ? "[set]" : "[null]"));
        if (request.getPassword() == null) {
            throw new IllegalArgumentException("Password cannot be null during registration");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setDescription(request.getDescription());
        User registered = userService.register(user);
        return ResponseEntity.ok(registered);
    }

    @GetMapping("/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        System.out.println("Attempting to fetch user: " + username);
        User user = userService.findByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        System.out.println("User not found: " + username);
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
            // If name changed and no avatar set, generate a new default avatar
            if (!user.isAvatarSet() && !user.getName().equals(updatedUser.getName())) {
                userService.generateDefaultAvatar(user);
            }
            // Update book owner fields
            bookService.updateBookOwnerFields(user);
            return ResponseEntity.ok(savedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{username}/avatar")
    public ResponseEntity<String> uploadAvatar(@PathVariable String username, @RequestParam("file") MultipartFile file) {
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            // Define upload directory
            String uploadDir = "uploads/avatars/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file with username as filename, convert to WebP
            String fileName = username + "_avatar.webp";
            Path filePath = uploadPath.resolve(fileName);
            try {
                java.awt.image.BufferedImage image = javax.imageio.ImageIO.read(file.getInputStream());
                if (image != null) {
                    boolean webpSupported = false;
                    for (String format : javax.imageio.ImageIO.getWriterFormatNames()) {
                        if (format.equalsIgnoreCase("WEBP")) {
                            webpSupported = true;
                            break;
                        }
                    }
                    if (webpSupported) {
                        javax.imageio.ImageIO.write(image, "WEBP", filePath.toFile());
                    } else {
                        javax.imageio.ImageIO.write(image, "PNG", filePath.toFile());
                        System.out.println("WebP format not supported, saved as PNG");
                    }
                } else {
                    Files.write(filePath, file.getBytes());
                    return ResponseEntity.badRequest().body("Failed to read image, saved original file");
                }
            } catch (Exception ex) {
                Files.write(filePath, file.getBytes());
                return ResponseEntity.badRequest().body("Error during image conversion: " + ex.getMessage() + ", saved original file");
            }

             // Update user's avatarSet flag
            user.setAvatarSet(true);
            userService.save(user);

            return ResponseEntity.ok("");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload avatar: " + e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody PasswordChangeRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.save(user);
        return ResponseEntity.ok("Password changed successfully");
    }

    public static class PasswordChangeRequest {
        private String oldPassword;
        private String newPassword;

        // getters and setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteAccount(Authentication authentication) {
        String username = authentication.getName();
        userService.deleteUser(username);
        return ResponseEntity.ok("Account deleted successfully");
    }
}
