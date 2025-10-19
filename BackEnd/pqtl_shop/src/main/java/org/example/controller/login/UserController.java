package org.example.controller.login;

import lombok.RequiredArgsConstructor;
import org.example.dto.response.UserResponse;
import org.example.model.login.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        UserResponse response = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }
}
