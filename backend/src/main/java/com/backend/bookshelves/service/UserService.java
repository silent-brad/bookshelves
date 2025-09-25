package com.backend.bookshelves.service;

import com.backend.bookshelves.model.User;
import com.backend.bookshelves.repository.UserRepository;
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
            String name = user.getName() != null && !user.getName().isEmpty() ? user.getName() : user.getUsername();
            String avatarUrl = "https://ui-avatars.com/api/?background=random&name=" + (name.contains(" ") ? name.replace(" ", "+") : name);
            java.net.URL url = new java.net.URL(avatarUrl);
            java.awt.image.BufferedImage image = javax.imageio.ImageIO.read(url);
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
                System.out.println("WebP format not supported, saved as PNG");
            }
            user.setAvatarSet(true);
            userRepository.save(user);
        } catch (Exception e) {
            System.out.println("Error generating default avatar: " + e.getMessage());
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
}
