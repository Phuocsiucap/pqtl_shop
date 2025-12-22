package org.example.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dto.ChatBotDTO;
import org.example.model.Product;
import org.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatBotService {

    @Autowired
    private ProductRepository productRepository;

    @Value("${gemini.api.key:YOUR_API_KEY_HERE}") // Cần config trong application.properties
    private String geminiApiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatBotDTO.ChatResponse processChat(String userMessage) {
        try {
            // Bước 1: Hỏi AI để trích xuất từ khóa nguyên liệu (Ví dụ: "Thịt kho" -> ["thịt heo", "trứng"])
            List<String> searchKeywords = extractKeywords(userMessage);

            // Bước 2: Tìm sản phẩm trong DB dựa trên keywords
            List<Product> availableProducts = searchProductsInDB(searchKeywords);

            // Bước 3: Đưa sản phẩm thật cho AI để nó gợi ý món ăn (RAG)
            return generateMealSuggestion(userMessage, availableProducts);

        } catch (Exception e) {
            e.printStackTrace();
            // Fallback response nếu lỗi
            return new ChatBotDTO.ChatResponse(
                "Xin lỗi, hiện tại Bếp Phó đang bận xíu. Bạn thử hỏi lại nhé! 🍳",
                new ArrayList<>()
            );
        }
    }

    // --- Helper Methods ---

    private List<String> extractKeywords(String message) {
        String prompt = "Phân tích câu hỏi: \"" + message + "\". " +
                "Liệt kê tối đa 5 nguyên liệu chính cần mua để nấu món liên quan. " +
                "Nếu user hỏi chung chung (ăn gì), hãy trả về: [\"thịt\", \"cá\", \"rau\", \"trứng\", \"đậu\"]. " +
                "Trả về JSON Array các string tiếng Việt CÓ DẤU. Ví dụ: [\"thịt heo\", \"trứng\", \"cá\"].";

        String responseText = callGemini(prompt);
        return parseJsonArray(responseText);
    }

    private List<Product> searchProductsInDB(List<String> keywords) {
        List<Product> products = new ArrayList<>();
        if (keywords == null || keywords.isEmpty()) return products;

        for (String kw : keywords) {
            // Tìm kiếm theo tên sản phẩm
            List<Product> found = productRepository.findByNameContainingIgnoreCase(kw, PageRequest.of(0, 5)).getContent();
            products.addAll(found);
        }
        // Deduplicate
        return products.stream().distinct().limit(15).collect(Collectors.toList());
    }

    private ChatBotDTO.ChatResponse generateMealSuggestion(String userMessage, List<Product> products) {
        // Tạo map productId -> imageUrl để map lại sau
        Map<String, String> productImageMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p.getImage() != null ? p.getImage() : "", (a, b) -> a));

        // Chuyển list sản phẩm thành chuỗi JSON nhỏ gọn để tiết kiệm token
        String productsJson = products.stream()
                .map(p -> String.format("{id:\"%s\", name:\"%s\", price:%s}",
                    p.getId(), p.getName(), p.getFinalPrice()))
                .collect(Collectors.joining(", "));

        String prompt = String.format(
            "Bạn là đầu bếp chuyên nghiệp, biết rất nhiều công thức nấu ăn Việt Nam và quốc tế. " +
            "User hỏi: \"%s\". " +
            "Dưới đây là danh sách nguyên liệu ĐANG CÓ tại cửa hàng: [%s]. " +
            "Nhiệm vụ: " +
            "1. Gợi ý 1-2 công thức nấu ăn PHỔ BIẾN phù hợp với yêu cầu của user. " +
            "2. Với mỗi công thức, liệt kê nguyên liệu cần thiết và MAP với sản phẩm có sẵn trong cửa hàng. " +
            "3. Nếu có nguyên liệu cần nhưng cửa hàng KHÔNG CÓ, liệt kê vào missingIngredients. " +
            "4. QUAN TRỌNG: Thêm cookingSteps - các bước nấu cơ bản (3-5 bước ngắn gọn). " +
            "Output bắt buộc là JSON theo cấu trúc sau (không markdown): " +
            "{ \"botMessage\": \"Lời chào thân thiện...\", \"suggestions\": [{ " +
            "\"recipeName\": \"Tên món\", " +
            "\"cookingTime\": \"30 phút\", " +
            "\"totalEstimatePrice\": 50000, " +
            "\"ingredients\": [{ \"productId\": \"id từ danh sách\", \"productName\": \"tên sản phẩm\", \"quantityToBuy\": 1, \"unitPrice\": 25000, \"total\": 25000 }], " +
            "\"missingIngredients\": [\"gia vị A\", \"nguyên liệu B\"], " +
            "\"cookingSteps\": [\"Bước 1: Sơ chế nguyên liệu...\", \"Bước 2: Ướp gia vị...\", \"Bước 3: Nấu...\"] " +
            "}] } " +
            "Lưu ý: botMessage thân thiện có emoji. productId PHẢI lấy CHÍNH XÁC từ field 'id' trong danh sách. cookingSteps phải dễ hiểu cho người mới nấu.",
            userMessage, productsJson
        );

        String jsonResponse = callGemini(prompt);
        // Clean markdown ```json ... ``` nếu có
        jsonResponse = jsonResponse.replace("```json", "").replace("```", "").trim();

        try {
            ChatBotDTO.ChatResponse response = objectMapper.readValue(jsonResponse, ChatBotDTO.ChatResponse.class);

            // Map lại imageUrl từ database dựa trên productId
            if (response.getSuggestions() != null) {
                for (ChatBotDTO.Suggestion suggestion : response.getSuggestions()) {
                    if (suggestion.getIngredients() != null) {
                        for (ChatBotDTO.Ingredient ingredient : suggestion.getIngredients()) {
                            String imageUrl = productImageMap.get(ingredient.getProductId());
                            ingredient.setImageUrl(imageUrl != null ? imageUrl : "");
                        }
                    }
                }
            }

            return response;
        } catch (Exception e) {
            System.out.println("AI Response Parse Error: " + jsonResponse);
            return new ChatBotDTO.ChatResponse("Bếp Phó gợi ý món ngon nhưng đang bị líu lưỡi chút xíu. Bạn đợi lát nhé!", new ArrayList<>());
        }
    }

    private String callGemini(String prompt) {
        try {
            String url = GEMINI_URL + "?key=" + geminiApiKey;

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(Map.of("text", prompt)));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            // Parse Gemini Response Structure
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    private List<String> parseJsonArray(String text) {
        try {
            text = text.replace("```json", "").replace("```", "").trim();
            // Fallback đơn giản nếu AI trả về string kiểu [a, b]
            if (text.startsWith("[")) {
                return objectMapper.readValue(text, List.class);
            }
            return Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
