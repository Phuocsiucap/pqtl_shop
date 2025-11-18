package org.example.model.login;

import lombok.*;
import org.example.model.Address;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;
import java.util.Set;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;
    private String username;
    private String email;
    private String password;
    @Field("user_type")
    private String userType = "Silver User";
    @Field("loyalty_points")
    private Integer loyaltyPoints = 0;
    @Field("is_active")
    private Boolean isActive = true;
    private List<Address> addresses;  
    private String role ;
    private boolean verified = false;
    
    // Thêm trường fullName - cần thiết cho admin API hiển thị tên người dùng
    private String fullName;
}
