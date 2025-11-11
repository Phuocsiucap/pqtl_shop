package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "search_history")
public class SearchHistory {
    @Id
    private String id;
    private String userId; // ID người dùng, nếu có
    private String keyword;
    private LocalDateTime searchDate;

    public SearchHistory() {
        this.searchDate = LocalDateTime.now();
    }
}