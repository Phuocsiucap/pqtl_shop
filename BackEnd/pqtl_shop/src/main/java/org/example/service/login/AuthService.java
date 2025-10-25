package org.example.service.login;

import org.example.entity.login.VerificationToken;
import org.example.repository.login.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.example.dto.request.LoginRequest;
import org.example.dto.request.RegisterRequest;
import org.example.dto.response.AuthResponse;
import org.example.dto.response.UserResponse;
import org.example.model.login.Role;
import org.example.model.login.User;
import org.example.repository.login.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

//    @Value("${google.client.id}")
//    private String googleClientId;
//
//    // ---------- GOOGLE LOGIN ----------
//    public AuthResponse loginWithGoogle(String idTokenString) {
//        try {
//            var verifier = new GoogleIdTokenVerifier.Builder(
//                    GoogleNetHttpTransport.newTrustedTransport(),
//                    GsonFactory.getDefaultInstance())
//                    .setAudience(Collections.singletonList(googleClientId))
//                    .build();
//
//            GoogleIdToken idToken = verifier.verify(idTokenString);
//            if (idToken == null) {
//                throw new RuntimeException("Invalid Google token");
//            }
//
//            var payload = idToken.getPayload();
//            String email = payload.getEmail();
//            String name = (String) payload.get("name");
//
//            var user = userRepository.findByEmail(email).orElseGet(() -> {
//                var newUser = new User();
//                newUser.setEmail(email);
//                newUser.setUsername(name);
//                newUser.setPassword(passwordEncoder.encode("oauth2"));
//                newUser.setRole("USER");
//                return userRepository.save(newUser);
//            });
//
//            String accessToken = jwtService.generateAccessToken(user.getEmail());
//            String refreshToken = jwtService.generateRefreshToken(user.getEmail());
//
//            return new AuthResponse(accessToken, refreshToken,null);
//        } catch (Exception e) {
//            throw new RuntimeException("Google login failed: " + e.getMessage());
//        }
//    }

    // ---------------------- REGISTER ----------------------
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    public AuthResponse register(RegisterRequest request) {
        // 1️⃣ Kiểm tra email trùng
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // 2️⃣ Tạo user chưa xác minh
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("CUSTOMER")
                .verified(false)
                .build();

        userRepository.save(user);

        // 3️⃣ Tạo token xác minh
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .userId(user.getId())
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();
        verificationTokenRepository.save(verificationToken);

        // 4️⃣ Gửi email xác minh
        String verifyLink = "http://localhost:8080/api/auth/verify?token=" + token;
        emailService.sendEmail(
                user.getEmail(),
                "Xác minh tài khoản của bạn",
                "Xin chào " + user.getUsername() + ",\n\n"
                        + "Vui lòng click vào liên kết sau để xác minh tài khoản của bạn:\n"
                        + verifyLink + "\n\n"
                        + "Liên kết sẽ hết hạn sau 24 giờ.\n\n"

        );

        // 5️⃣ Thông báo đăng ký thành công nhưng chưa kích hoạt
        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .message("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.")
                .build();
    }


    // ---------------------- LOGIN ----------------------
    public AuthResponse login(LoginRequest request) {
        // Cho phép login bằng username hoặc email
        Optional<User> userOpt = userRepository.findByEmail(request.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(accessToken, refreshToken,null);
    }

    // ---------------------- REFRESH TOKEN ----------------------
    public AuthResponse refreshToken(String refreshToken) {
        // Kiểm tra refresh token hợp lệ
        String email = jwtService.extractUsername(refreshToken);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user.getEmail())) {
            throw new RuntimeException("Invalid refresh token");
        }

        // Tạo access token mới
        String newAccessToken = jwtService.generateAccessToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Giữ nguyên refresh token cũ
                .build();
    }

    // ---------------------- ADMIN CREATE USER ----------------------
    public UserResponse createUserByAdmin(RegisterRequest request, Role role) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role.name()) // STAFF hoặc ADMIN
                .build();

        userRepository.save(user);

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
    }

    // ---------------------- ADMIN GET ALL USERS ----------------------
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getEmail(), u.getRole()))
                .collect(Collectors.toList());
    }
}
