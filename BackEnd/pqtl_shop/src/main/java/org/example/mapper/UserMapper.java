package org.example.mapper;

import org.example.dto.response.UserResponse;
import org.example.model.login.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toUserResponse(User user);
}
