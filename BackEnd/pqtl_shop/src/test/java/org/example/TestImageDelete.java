package org.example;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.util.HashMap;
import java.util.Map;

public class TestImageDelete {
    public static void main(String[] args) {
        System.out.println("Starting Cloudinary Delete Test...");
        
        // Config
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dvwsunmb3");
        config.put("api_key", "245186988572299");
        config.put("api_secret", "C65RQK4V-G-sger9tcaJFtcc4UM");
        
        Cloudinary cloudinary = new Cloudinary(config);
        
        // Test URL extraction logic
        String[] testUrls = {
            "http://res.cloudinary.com/dvwsunmb3/image/upload/v1733059885/c8j5k6l7m8n9o0p1q2r3.jpg",
            "https://res.cloudinary.com/dvwsunmb3/image/upload/v123456/folder/sample.png",
            "https://res.cloudinary.com/dvwsunmb3/image/upload/sample_no_version.jpg"
        };

        for (String oldImageUrl : testUrls) {
            System.out.println("\nTesting URL: " + oldImageUrl);
            try {
                int uploadIndex = oldImageUrl.indexOf("upload/");
                if (uploadIndex != -1) {
                    String path = oldImageUrl.substring(uploadIndex + 7); // skip "upload/"
                    // skip version if present (starts with v and numbers)
                    if (path.startsWith("v")) {
                        int slashIndex = path.indexOf("/");
                        if (slashIndex != -1) {
                            path = path.substring(slashIndex + 1);
                        }
                    }
                    // Remove extension
                    if (path.contains(".")) {
                        path = path.substring(0, path.lastIndexOf("."));
                    }
                    // Decode URL if needed
                    path = java.net.URLDecoder.decode(path, java.nio.charset.StandardCharsets.UTF_8);
                    
                    System.out.println("Extracted Public ID: " + path);
                    
                    // Try to delete (only if it looks like a real test ID, otherwise just print)
                    // We won't actually delete here to avoid errors, just verifying logic.
                    // But for the FIRST one, let's try to delete if it exists (it probably doesn't).
                    // Actually, let's try to upload a file then delete it to verify the full flow.
                } else {
                    System.out.println("Could not find 'upload/' in URL");
                }
            } catch (Exception e) {
                System.out.println("Error extracting: " + e.getMessage());
            }
        }
    }
}
