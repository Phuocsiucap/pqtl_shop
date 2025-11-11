package org.example.repository;

import org.example.model.SearchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SearchHistoryRepository extends MongoRepository<SearchHistory, String> {
    // US1.5: Lấy lịch sử tìm kiếm của người dùng (giả sử userId là ID của người dùng đã đăng nhập)
    List<SearchHistory> findTop10ByUserIdOrderBySearchDateDesc(String userId);

    // Lấy 10 từ khóa được tìm kiếm nhiều nhất (cho gợi ý chung)
    // Lưu ý: Việc này phức tạp hơn, cần aggregation. Tạm thời chỉ cung cấp hàm cơ bản.
    // List<String> findTopKeywords();
}