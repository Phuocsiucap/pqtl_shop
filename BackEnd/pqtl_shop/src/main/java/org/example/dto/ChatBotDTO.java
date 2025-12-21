package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class ChatBotDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatRequest {
        private String message;
        private String userId; // Optional: để cá nhân hóa sau này
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatResponse {
        private String botMessage; // Lời dẫn của bot
        private List<Suggestion> suggestions; // Danh sách món ăn gợi ý
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Suggestion {
        private String recipeName;
        private String cookingTime;
        private double totalEstimatePrice;
        private List<Ingredient> ingredients;
        private List<String> missingIngredients;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Ingredient {
        private String productId;
        private String productName;
        private int quantityToBuy;
        private double unitPrice;
        private double total;
        private String note;
        private String imageUrl;
    }
}
