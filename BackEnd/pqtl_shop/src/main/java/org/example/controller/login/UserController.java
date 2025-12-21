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

        String email = authentication.getName();
        User user = userService.getUser(email);
        UserResponse response = userMapper.toUserResponse(user);
        return ResponseEntity.ok(response);
    }


    // ✅ Lấy thông tin user
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(userService.getUser(email));
    }

    // ✅ Cập nhật thông tin user
    @PutMapping("/update")
    public ResponseEntity<User> updateUser(Authentication auth, @RequestBody User updatedUser) {
        String email = auth.getName();
        return ResponseEntity.ok(userService.updateUser(email, updatedUser));
    }

    // ✅ Cập nhật điểm thưởng
    @PostMapping("/submit-score")
    public ResponseEntity<User> addPoints(Authentication auth, @RequestParam int score) {
        String email = auth.getName();
        return ResponseEntity.ok(userService.addPoints(email, score));
    }

    // ✅ Lấy danh sách địa chỉ
    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(userService.getAddresses(email));
    }

    // ✅ Thêm địa chỉ
    @PostMapping("/addresses")
    public ResponseEntity<Address> addAddress(Authentication auth, @RequestBody Address address) {
        String email = auth.getName();
        Address newAddress = userService.addAddress(email, address);
        return ResponseEntity.status(201).body(newAddress);
    }

    // ✅ Cập nhật địa chỉ
    @PutMapping("/addresses/{id}")
    public ResponseEntity<Address> updateAddress(Authentication auth, @PathVariable String id, @RequestBody Address address) {
        String email = auth.getName();
        Address updated = userService.updateAddress(email, id, address);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Xóa địa chỉ
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(Authentication auth, @PathVariable String id) {
        String email = auth.getName();
        boolean deleted = userService.deleteAddress(email, id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

