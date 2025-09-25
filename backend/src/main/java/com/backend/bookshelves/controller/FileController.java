package com.backend.bookshelves.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
public class FileController {

    @GetMapping("/avatars/{filename}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads/avatars/").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/webp";
                return ResponseEntity.ok()
                        .header("Content-Type", contentType)
                        .body(resource);
            } else {
                System.out.println("File not found or not readable: " + filePath.toString());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("Error serving file: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
