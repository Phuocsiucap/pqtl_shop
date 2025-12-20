package org.example.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
//
//
//@Configuration
//@RequiredArgsConstructor
//public class SecurityConfig {
//
//    private final JwtAuthenticationFilter jwtAuthFilter;
//    private final CustomOAuth2SuccessHandler oAuth2SuccessHandler;
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .csrf(csrf -> csrf.disable())
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/verify").permitAll()
//                        .requestMatchers("/api/products").permitAll()
//                        // Cho phép truy cập công khai các API tìm kiếm, chi tiết sản phẩm và trang chủ (GET)
//                        .requestMatchers("/api/v1/search/**").permitAll()
//                        .requestMatchers("/api/v1/products/**").permitAll()
//                        .requestMatchers("/api/v1/homepage/**").permitAll() // Bổ sung cho Homepage
//                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
//                        .anyRequest().authenticated()
//                )
//                .oauth2Login(oauth2 -> oauth2
//                        .successHandler(oAuth2SuccessHandler) // ✅ xử lý sau khi login Google thành công
//                        .defaultSuccessUrl("http://localhost:3000/",true)
//                )
//                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
//        return config.getAuthenticationManager();
//    }
//
//    @Bean
//    public CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.setAllowedOriginPatterns(List.of("http://localhost:8888", "http://localhost:8891", "*")); // 👈 Bổ sung cổng 8891
//        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"));
//        configuration.setAllowedHeaders(List.of("*"));
//        configuration.setAllowCredentials(true); // 👈 Cho phép cookie / Authorization
//        configuration.setExposedHeaders(List.of("Authorization")); // 👈 Nếu bạn muốn FE đọc header token
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }
//
//}


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomOAuth2SuccessHandler oAuth2SuccessHandler;
    
    @Value("${CORS_ALLOWED_ORIGINS:}")
    private String corsAllowedOrigins; // comma-separated list; may be empty

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Cho phép các API public
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // preflight
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/verify"
                        ).permitAll()
                        // Cho phép truy cập công khai các API tìm kiếm, chi tiết sản phẩm và trang chủ (GET)
                        .requestMatchers("/api/v1/search/**").permitAll()
                        .requestMatchers("/api/v1/products/**").permitAll()
                        .requestMatchers("/api/v1/homepage/**").permitAll()
                        .requestMatchers("/api/v1/categories/**").permitAll()
                        .requestMatchers("/api/v1/vouchers/**").permitAll()

                        // ==================== STAFF + ADMIN ====================
                        // Quản lý sản phẩm - STAFF và ADMIN đều được truy cập
                        .requestMatchers("/api/v1/admin/goods/**").hasAnyAuthority("ADMIN", "STAFF")

                        // Quản lý đơn hàng - STAFF và ADMIN đều được truy cập
                        .requestMatchers("/api/v1/admin/orders/**").hasAnyAuthority("ADMIN", "STAFF")

                        // Quản lý đánh giá - STAFF và ADMIN đều được truy cập
                        .requestMatchers("/api/v1/admin/reviews/**").hasAnyAuthority("ADMIN", "STAFF")

                        // Bàn giao ca - STAFF và ADMIN đều được truy cập
                        .requestMatchers("/api/v1/shift/**").hasAnyAuthority("ADMIN", "STAFF")

                        // Upload ảnh - STAFF và ADMIN đều được truy cập (để upload ảnh sản phẩm)
                        .requestMatchers("/api/v1/upload/**").hasAnyAuthority("ADMIN", "STAFF")

                        // Quản lý danh mục - STAFF và ADMIN đều được thêm/sửa/xóa
                        .requestMatchers(HttpMethod.POST, "/api/v1/categories/**").hasAnyAuthority("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/categories/**").hasAnyAuthority("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasAnyAuthority("ADMIN", "STAFF")

                        // ==================== CHỈ ADMIN ====================
                        // Các API admin khác chỉ ADMIN mới được truy cập
                        .requestMatchers("/api/v1/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler)
                )
                // Xử lý khi request không có token hoặc token không hợp lệ
                // Trả về 401 JSON thay vì redirect đến trang login OAuth2
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Bạn cần đăng nhập để truy cập tài nguyên này\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Bạn không có quyền truy cập tài nguyên này\"}");
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Determine origins: priority -> system env -> application property -> .env file -> default
        String originsRaw = System.getenv("CORS_ALLOWED_ORIGINS");
        if (originsRaw == null || originsRaw.isBlank()) {
            originsRaw = corsAllowedOrigins; // property value
        }
        // If still empty, try to read .env in project root
        if (originsRaw == null || originsRaw.isBlank()) {
            try {
                Path envPath = Path.of(".env");
                if (Files.exists(envPath)) {
                    List<String> lines = Files.readAllLines(envPath, StandardCharsets.UTF_8);
                    for (String line : lines) {
                        String l = line.strip();
                        if (l.startsWith("#") || l.isBlank() || !l.contains("=")) continue;
                        String[] parts = l.split("=", 2);
                        String key = parts[0].trim();
                        String val = parts[1].trim();
                        if (key.equals("CORS_ALLOWED_ORIGINS")) {
                            originsRaw = val;
                            break;
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (originsRaw == null || originsRaw.isBlank()) {
            originsRaw = "http://localhost:3000"; // fallback default
        }

        List<String> allowedOrigins = Arrays.stream(originsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        configuration.setAllowedOriginPatterns(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // ✅ cho phép cookie / Authorization
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}