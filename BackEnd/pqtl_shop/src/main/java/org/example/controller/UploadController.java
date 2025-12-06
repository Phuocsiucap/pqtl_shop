package org.example.controller;

import org.example.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/upload")
public class UploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn file để tải lên."));
        }

        try {
            // 1. Nhận Map kết quả đầy đủ từ Service
            Map uploadResult = cloudinaryService.uploadFile(file);

            // 2. Trích xuất Secure URL và Public ID từ Map
            // Cần ép kiểu rõ ràng sang String vì các giá trị trong Map là Object
            String secureUrl = (String) uploadResult.get("secure_url");

            // 3. Trả về đối tượng JSON chứa các thông tin cần thiết
            return ResponseEntity.ok(Map.of(
                    "url", secureUrl
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Tải lên thất bại: " + e.getMessage()));
        }
    }
}
