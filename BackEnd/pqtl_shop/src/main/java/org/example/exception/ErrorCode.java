package org.example.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    INVALID_KEY(9999, "Invalid message key", HttpStatus.INTERNAL_SERVER_ERROR),

    USER_EXISTED(1001, "Account already exists", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "User name must be at least 3 characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least 6 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Password is incorrect", HttpStatus.UNAUTHORIZED),
    INVALID_DOB(1008, "Invalid date of birth", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1009, "User not found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(1010, "Unauthorized: Invalid or missing token", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(1011, "Forbidden: You do not have permission to access this resource", HttpStatus.FORBIDDEN),
    INVALID_REQUEST(1012, "Invalid request", HttpStatus.BAD_REQUEST),

    // Friendship errors
    FRIEND_REQUEST_ALREADY_SENT(1013, "Friend request already sent", HttpStatus.BAD_REQUEST),
    ALREADY_FRIENDS(1014, "Users are already friends", HttpStatus.BAD_REQUEST),
    REVERSE_FRIEND_REQUEST_EXISTS(1015, "The other user has already sent you a friend request", HttpStatus.BAD_REQUEST),
    CANNOT_ADD_YOURSELF(1016, "Cannot send friend request to yourself", HttpStatus.BAD_REQUEST),
    FRIEND_REQUEST_NOT_FOUND(1017, "Friend request not found", HttpStatus.NOT_FOUND),
    INVALID_FRIEND_REQUEST_STATUS(1018, "Invalid friend request status", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus statusCode;


    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
