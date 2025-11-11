package org.example.controller.login;

import lombok.RequiredArgsConstructor;
import org.example.dto.response.UserResponse;
import org.example.mapper.UserMapper;
import org.example.model.Address;
import org.example.model.login.User;
import org.example.repository.login.UserDetailsImpl;
import org.example.service.login.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        // Lấy thông tin từ UserDetailsImpl

        String username = authentication.getName();
        User user = userService.getUser(username);
        UserResponse response = userMapper.toUserResponse(user);
        return ResponseEntity.ok(response);
    }


    // ✅ Lấy thông tin user
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(userService.getUser(username));
    }

    // ✅ Cập nhật thông tin user
    @PutMapping("/update")
    public ResponseEntity<User> updateUser(Authentication auth, @RequestBody User updatedUser) {
        String username = auth.getName();
        return ResponseEntity.ok(userService.updateUser(username, updatedUser));
    }

    // ✅ Cập nhật điểm thưởng
    @PostMapping("/submit-score")
    public ResponseEntity<User> addPoints(Authentication auth, @RequestParam int score) {
        String username = auth.getName();
        return ResponseEntity.ok(userService.addPoints(username, score));
    }

    // ✅ Lấy danh sách địa chỉ
    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(userService.getAddresses(username));
    }

    // ✅ Thêm địa chỉ
    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(Authentication auth, @RequestBody Address address) {
        String username = auth.getName();
        return ResponseEntity.ok(userService.addAddress(username, address));
    }
}

