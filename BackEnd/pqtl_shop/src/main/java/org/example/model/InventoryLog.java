package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "inventory_logs")
public class InventoryLog {
    @Id
    private String id;
    private String productId;
    private int changeAmount; // Positive for import, negative for export/sale
    private String reason; // IMPORT, SALE, DAMAGED, RETURN
    private Instant timestamp = Instant.now();
    private String userId; // User who performed the action
    private String note;
}
