package org.example.service.login;

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

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ---------------------- REGISTER ----------------------
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("CUSTOMER") // mặc định
                .build();

        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return new AuthResponse(accessToken, refreshToken);
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

        return new AuthResponse(accessToken, refreshToken);
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
