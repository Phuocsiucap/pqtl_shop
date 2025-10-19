//package org.example.config;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.social_network.social_network.controller.MessageRouter;
//import com.social_network.social_network.dto.WebSocketMessageDTO;
//import com.social_network.social_network.respository.UserRepository;
//import com.social_network.social_network.service.WebSocketSessionManager;
//import com.social_network.social_network.util.JwtUtil;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Component;
//import org.springframework.web.socket.*;
//import org.springframework.web.util.UriComponentsBuilder;
//
//import java.net.URI;
//import java.net.URLDecoder;
//import java.nio.charset.StandardCharsets;
//import java.util.Map;
//import java.util.concurrent.ConcurrentHashMap;
//
//@Slf4j
//@Component
//@RequiredArgsConstructor
//public class WebSocketHandler implements org.springframework.web.socket.WebSocketHandler {
//
//    private final JwtUtil jwtUtil;
//    private final ObjectMapper objectMapper;
//    private final WebSocketSessionManager sessionManager;
//    private final MessageRouter messageRouter;
//    private final UserRepository userRepository;
//    @Override
//    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
//        try {
//            URI uri = session.getUri();
//            if (uri == null) {
//                log.warn("URI is null, closing connection");
//                closeSessionSafely(session, CloseStatus.BAD_DATA.withReason("Invalid URI"));
//                return;
//            }
//
//            Map<String, String> params = parseQueryParams(uri.getRawQuery());
//            String token = params.get("token");
//            String tabId = params.get("tabId");
//
//            // Validate parameters
//            if (token == null || token.trim().isEmpty()) {
//                log.warn("Missing token parameter");
//                closeSessionSafely(session, CloseStatus.NOT_ACCEPTABLE.withReason("Missing token"));
//                return;
//            }
//
//            if (tabId == null || tabId.trim().isEmpty()) {
//                log.warn("Missing tabId parameter");
//                closeSessionSafely(session, CloseStatus.NOT_ACCEPTABLE.withReason("Missing tabId"));
//                return;
//            }
//
//            // Validate JWT
//            if (!jwtUtil.validateToken(token)) {
//                log.warn("Invalid JWT token");
//                closeSessionSafely(session, CloseStatus.NOT_ACCEPTABLE.withReason("Invalid token"));
//                return;
//            }
//
//            String userId = jwtUtil.getUserIdFromToken(token);
//            if (userId == null || userId.trim().isEmpty()) {
//                log.warn("Could not extract userId from token");
//                closeSessionSafely(session, CloseStatus.NOT_ACCEPTABLE.withReason("Invalid token payload"));
//                return;
//            }
//
//            // Store session info
//            session.getAttributes().put("userId", userId);
//            session.getAttributes().put("tabId", tabId);
//            session.getAttributes().put("token", token);
//
//            // Register session
//            sessionManager.addSession(userId, tabId, session);
//            userRepository.updateStatus(userId, "ON");
//            log.info("WebSocket connected: userId={}, tabId={}, sessionId={}",
//                    userId, tabId, session.getId());
//
//        } catch (Exception e) {
//            log.error("Error establishing WebSocket connection", e);
//            closeSessionSafely(session, CloseStatus.SERVER_ERROR.withReason("Connection setup failed"));
//            throw e;
//        }
//    }
//
//    @Override
//    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
//        String userId = (String) session.getAttributes().get("userId");
//        String tabId = (String) session.getAttributes().get("tabId");
//
//        if (userId != null && tabId != null) {
//            sessionManager.removeSession(userId, session);
//            log.info("WebSocket disconnected: userId={}, tabId={}, status={}",
//                    userId, tabId, status.getCode());
//            userRepository.updateStatus(userId,"OFF");
//        } else {
//            log.warn("WebSocket closed but userId/tabId not found in session");
//        }
//    }
//
//    @Override
//    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
//        try {
//            if (!session.isOpen()) {
//                log.warn("Received message on closed session: {}", session.getId());
//                return;
//            }
//
//            JsonNode jsonNode = objectMapper.readTree(message.getPayload().toString());
//            WebSocketMessageDTO wsMessage = objectMapper.convertValue(jsonNode, WebSocketMessageDTO.class);
//
//            messageRouter.routeMessage(session, wsMessage);
//
//        } catch (Exception e) {
//            log.error("Error handling message from session {}: {}", session.getId(), e.getMessage());
//            // Don't close session for message handling errors, just log them
//        }
//    }
//
//    @Override
//    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
//        String userId = (String) session.getAttributes().get("userId");
//        String sessionId = session.getId();
//
//        // Check for common client disconnection errors that we should ignore
//        if (isClientDisconnectionError(exception)) {
//            log.debug("Client disconnection detected for session {}, userId={}: {}",
//                    sessionId, userId, exception.getMessage());
//        } else {
//            log.error("WebSocket transport error for session {}, userId={}: {}",
//                    sessionId, userId, exception.getMessage());
//        }
//
//        // Remove from session manager first
//        if (userId != null) {
//            sessionManager.removeSession(userId, session);
//        }
//
//        // Close session safely
//        closeSessionSafely(session, CloseStatus.SERVER_ERROR);
//    }
//
//    @Override
//    public boolean supportsPartialMessages() {
//        return false;
//    }
//
//    /**
//     * Parse query parameters safely
//     */
//    private Map<String, String> parseQueryParams(String query) {
//        Map<String, String> result = new ConcurrentHashMap<>();
//
//        if (query == null || query.trim().isEmpty()) {
//            return result;
//        }
//
//        try {
//            // Use Spring's UriComponentsBuilder
//            UriComponentsBuilder.fromUriString("?" + query)
//                    .build()
//                    .getQueryParams()
//                    .forEach((key, values) -> {
//                        if (!values.isEmpty()) {
//                            result.put(key, values.get(0));
//                        }
//                    });
//        } catch (Exception e) {
//            log.warn("Failed to parse query params with Spring, falling back to manual parsing");
//
//            // Manual parsing fallback
//            try {
//                for (String param : query.split("&")) {
//                    if (param.trim().isEmpty()) continue;
//
//                    String[] pair = param.split("=", 2);
//                    if (pair.length == 2) {
//                        String key = URLDecoder.decode(pair[0].trim(), StandardCharsets.UTF_8);
//                        String value = URLDecoder.decode(pair[1].trim(), StandardCharsets.UTF_8);
//                        result.put(key, value);
//                    }
//                }
//            } catch (Exception fallbackException) {
//                log.error("Failed to parse query parameters: {}", query, fallbackException);
//            }
//        }
//
//        return result;
//    }
//
//    /**
//     * Safely close WebSocket session without throwing exceptions
//     */
//    private void closeSessionSafely(WebSocketSession session, CloseStatus status) {
//        try {
//            if (session != null && session.isOpen()) {
//                session.close(status);
//            }
//        } catch (Exception e) {
//            // Ignore close errors, they're common when client already disconnected
//            log.debug("Error closing session {}: {}", session.getId(), e.getMessage());
//        }
//    }
//
//    /**
//     * Check if exception is due to client disconnection
//     */
//    private boolean isClientDisconnectionError(Throwable exception) {
//        if (exception == null) return false;
//
//        String message = exception.getMessage();
//        if (message == null) return false;
//
//        // Common client disconnection error patterns
//        return message.contains("connection was aborted") ||
//                message.contains("Connection reset") ||
//                message.contains("Broken pipe") ||
//                message.contains("EOFException") ||
//                exception instanceof java.io.EOFException;
//    }
//}
////https://claude.ai/chat/32f9bf00-0f99-41ee-bdda-684d0a75509f
