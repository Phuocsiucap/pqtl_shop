package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final AuthResponse instance = new AuthResponse();
        public Builder accessToken(String t) { instance.accessToken = t; return this; }
        public Builder refreshToken(String t) { instance.refreshToken = t; return this; }
        public AuthResponse build() { return instance; }
    }

}
