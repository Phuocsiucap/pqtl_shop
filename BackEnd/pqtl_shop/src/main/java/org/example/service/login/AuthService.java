package org.example.service.login;

import lombok.RequiredArgsConstructor;
import org.example.dto.request.LoginRequest;
import org.example.dto.request.RegisterRequest;
import org.example.dto.response.AuthResponse;
import org.example.dto.response.UserResponse;
import org.example.entity.login.VerificationToken;
import org.example.mapper.UserMapper;
import org.example.model.login.Role;
import org.example.model.login.User;
import org.example.repository.login.UserRepository;
import org.example.repository.login.VerificationTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final UserMapper userMapper;

    // ---------------------- REGISTER ----------------------
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
                .isActive(true)
                .loyaltyPoints(0)
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
                .message("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.")
                .build();
    }

    // ---------------------- LOGIN ----------------------
    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getUsername());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(request.getUsername());
        }

        User user = userOpt.orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Sai mật khẩu");
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(user))
                .message("Đăng nhập thành công")
                .build();
    }

    // ---------------------- REFRESH TOKEN ----------------------
    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user.getEmail())) {
            throw new RuntimeException("Invalid refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    // ---------------------- ADMIN CREATE USER ----------------------
    public UserResponse createUserByAdmin(RegisterRequest request, Role role) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role.name())
                .verified(true)
                .isActive(true)
                .build();

        userRepository.save(user);
        return userMapper.toUserResponse(user); // ✅ auto map
    }

    // ---------------------- ADMIN GET ALL USERS ----------------------
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toUserResponse) // ✅ dùng mapstruct thay vì thủ công
                .collect(Collectors.toList());
    }
}
