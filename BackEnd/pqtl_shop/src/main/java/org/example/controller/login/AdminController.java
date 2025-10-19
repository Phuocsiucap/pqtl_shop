package org.example.controller.login;

import lombok.RequiredArgsConstructor;
import org.example.dto.request.RegisterRequest;
import org.example.dto.response.UserResponse;
import org.example.model.login.Role;
import org.example.service.login.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService authService;

    @PostMapping("/create-user")
    public ResponseEntity<UserResponse> createUser(@RequestBody RegisterRequest request,
                                                   @RequestParam Role role) {
        // role = STAFF hoặc ADMIN
        return ResponseEntity.ok(authService.createUserByAdmin(request, role));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }
}
