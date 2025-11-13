package org.example.exception;


import org.example.dto.response.APIResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice //annotation xy ly ngoai le
public class    GlobalExceptionHandler {


    @ExceptionHandler(value = Exception.class)
    ResponseEntity<APIResponse> handlingRuntimeException(Exception e){
        APIResponse apiResponse = new APIResponse();
        apiResponse.setCode(9999);

        apiResponse.setMessage(e.getMessage());
        apiResponse.setSuccess(false);
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<APIResponse> handlingAppException(AppException e){
        APIResponse apiResponse = new APIResponse();
        ErrorCode errorCode = e.getErrorCode();
        apiResponse.setCode(errorCode.getCode());

        apiResponse.setMessage(errorCode.getMessage());
        apiResponse.setSuccess(false);
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public APIResponse<?> handleIllegalArgument(IllegalArgumentException e) {
        return APIResponse.builder()
                .success(false)
                .code(400)
                .message(e.getMessage())
                .build();
    }

    @ExceptionHandler(IOException.class)
    public APIResponse<?> handleIOException(IOException e) {
        return APIResponse.builder()
                .success(false)
                .code(500)
                .message("Internal error: " + e.getMessage())
                .build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
