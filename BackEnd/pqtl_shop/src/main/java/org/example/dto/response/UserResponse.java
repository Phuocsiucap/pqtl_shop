package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.Address;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String role;
    private String userType;
    private Integer loyaltyPoints ;
    private Boolean isActive ;

}