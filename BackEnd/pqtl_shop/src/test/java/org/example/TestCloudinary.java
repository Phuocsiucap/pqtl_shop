package org.example;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class TestCloudinary {
    public static void main(String[] args) {
        System.out.println("Starting Cloudinary Test...");
        
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dvwsunmb3");
        config.put("api_key", "245186988572299");
        config.put("api_secret", "C65RQK4V-G-sger9tcaJFtcc4UM");
        
        Cloudinary cloudinary = new Cloudinary(config);
        
        try {
            File file = new File("C:\\Users\\Phuoc\\.gemini\\antigravity\\brain\\96eedc25-ed95-4d14-bc6c-6a7d0131f74e\\placeholder_image_1764588169142.png");
            System.out.println("Uploading file: " + file.getAbsolutePath());
            
            if (!file.exists()) {
                System.out.println("File does not exist!");
                return;
            }

            Map uploadResult = cloudinary.uploader().upload(file, ObjectUtils.asMap("resource_type", "auto"));
            
            System.out.println("Upload Successful!");
            System.out.println("Result: " + uploadResult);
        } catch (Exception e) {
            System.out.println("Upload Failed!");
            e.printStackTrace();
        }
    }
}
