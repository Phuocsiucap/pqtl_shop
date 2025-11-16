package org.example.controller.login;

import lombok.RequiredArgsConstructor;
import org.example.dto.request.LoginRequest;
import org.example.dto.request.RegisterRequest;
import org.example.dto.response.AuthResponse;
import org.example.dto.response.UserResponse;
import org.example.model.login.User;
import org.example.repository.login.UserRepository;
import org.example.repository.login.VerificationTokenRepository;
import org.example.service.login.AuthService;
import org.example.service.login.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestParam String refreshToken) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }
//
//    @PostMapping("/oauth2/google")
//    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody Map<String, String> body) {
//        String idToken = body.get("token");
//        return ResponseEntity.ok(authService.loginWithGoogle(idToken));
//    }

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;

    @GetMapping("/verify")
    public ResponseEntity<String> verifyAccount(@RequestParam String token) {
        var verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token đã hết hạn");
        }

        var user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // ✅ Cập nhật trạng thái
        user.setVerified(true);
        user.setIsActive(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);

        return ResponseEntity.ok("Xác minh tài khoản thành công! Bạn có thể đăng nhập.");
    }
    private final JwtService jwtService;
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(user);
    }


}