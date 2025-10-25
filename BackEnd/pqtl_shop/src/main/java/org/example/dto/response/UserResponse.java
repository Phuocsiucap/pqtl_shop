package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.bind.annotation.CrossOrigin;

@Data
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String role;
}