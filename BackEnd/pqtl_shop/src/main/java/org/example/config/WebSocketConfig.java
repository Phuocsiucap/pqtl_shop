//package org.example.config;
//
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.socket.config.annotation.*;
//
//@Configuration
//@EnableWebSocket
//@RequiredArgsConstructor
//public class WebSocketConfig implements WebSocketConfigurer {
//
//    private final WebSocketHandler webSocketHandler;
//
//    @Override
//    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//        //dang ky endponit websocket tai //ws/chat
//        //cho phep tat ca cac origin dung(cors) -(co the gioi han neu can)
//        registry.addHandler(webSocketHandler, "/ws").setAllowedOrigins("*");
//
//    }
//}
