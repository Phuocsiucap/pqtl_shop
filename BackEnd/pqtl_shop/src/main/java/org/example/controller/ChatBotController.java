package org.example.controller;

import org.example.dto.ChatBotDTO;
import org.example.service.ChatBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatBotController {

    @Autowired
    private ChatBotService chatBotService;

    @PostMapping("/chat")
    public ResponseEntity<ChatBotDTO.ChatResponse> chat(@RequestBody ChatBotDTO.ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        ChatBotDTO.ChatResponse response = chatBotService.processChat(request.getMessage());
        return ResponseEntity.ok(response);
    }
}
