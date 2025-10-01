package com.backend.bookshelves.service;

import com.backend.bookshelves.model.User;
import com.backend.bookshelves.repository.UserRepository;
import com.backend.bookshelves.service.BookService;
import java.io.File;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
 
    @Autowired
    private BookService bookService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        if (userRepository.findByUsername(user.getUsername()) != null) {
            throw new RuntimeException("Username already exists");
        }
        if (user.getPassword() == null) {
            throw new IllegalArgumentException("Password cannot be null");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setAvatarSet(false);
        User savedUser = userRepository.save(user);
        generateDefaultAvatar(savedUser);
        return savedUser;
    }

    public void generateDefaultAvatar(User user) {
        try {
            String name = (user.getName() != null && !user.getName().isEmpty() ? user.getName().trim() : user.getUsername().trim());
            String processedName = java.net.URLEncoder.encode(name, "UTF-8");
            String avatarUrl = "https://ui-avatars.com/api/?background=random&name=" + processedName + "&format=png";
            java.net.URL url = new java.net.URL(avatarUrl);
            java.awt.image.BufferedImage image = javax.imageio.ImageIO.read(url);
            if (image == null) {
                throw new RuntimeException("Failed to read image from URL: " + avatarUrl);
            }
            java.io.File outputDir = new java.io.File("uploads/avatars/");
            if (!outputDir.exists()) {
                outputDir.mkdirs();
            }
            java.io.File outputFile = new java.io.File(outputDir, user.getUsername() + "_avatar.webp");
            // Convert to WebP if possible, otherwise save as PNG
            boolean webpSupported = false;
            for (String format : javax.imageio.ImageIO.getWriterFormatNames()) {
                if (format.equalsIgnoreCase("WEBP")) {
                    webpSupported = true;
                    break;
                }
            }
            if (webpSupported) {
                javax.imageio.ImageIO.write(image, "WEBP", outputFile);
            } else {
                javax.imageio.ImageIO.write(image, "PNG", outputFile);
                logger.warning("WebP format not supported, saved as PNG");
            }
        } catch (Exception e) {
            logger.severe("Error generating default avatar: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return user;
    }

    public void deleteUser(String username) {
        User user = findByUsername(username);
        if (user != null) {
            bookService.deleteBooksByOwner(user);
            userRepository.delete(user);
            // Delete avatar
            File avatarFile = new File("uploads/avatars/" + user.getUsername() + "_avatar.webp");
            if (avatarFile.exists()) {
                avatarFile.delete();
            }
        } else {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
    }
}
