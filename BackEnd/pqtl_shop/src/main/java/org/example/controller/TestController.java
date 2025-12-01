package org.example.controller;

import org.example.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/test-cloudinary")
public class TestController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/")
    public ResponseEntity<?> testUpload() {
        try {
            File file = new File("C:\\Users\\Phuoc\\.gemini\\antigravity\\brain\\96eedc25-ed95-4d14-bc6c-6a7d0131f74e\\placeholder_image_1764588169142.png");
            if (!file.exists()) {
                return ResponseEntity.badRequest().body("File not found: " + file.getAbsolutePath());
            }

            MultipartFile multipartFile = new CustomMultipartFile(file);

            Map result = cloudinaryService.uploadFile(multipartFile);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    // Custom MultipartFile implementation to avoid spring-test dependency
    public static class CustomMultipartFile implements MultipartFile {
        private final File file;

        public CustomMultipartFile(File file) {
            this.file = file;
        }

        @Override
        public String getName() {
            return "file";
        }

        @Override
        public String getOriginalFilename() {
            return file.getName();
        }

        @Override
        public String getContentType() {
            return "image/png";
        }

        @Override
        public boolean isEmpty() {
            return file.length() == 0;
        }

        @Override
        public long getSize() {
            return file.length();
        }

        @Override
        public byte[] getBytes() throws IOException {
            return Files.readAllBytes(file.toPath());
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new FileInputStream(file);
        }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            Files.copy(file.toPath(), dest.toPath());
        }
    }
}