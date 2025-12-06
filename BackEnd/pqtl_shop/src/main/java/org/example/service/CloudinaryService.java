
package org.example.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    // Spring tự động tiêm (Inject) Bean Cloudinary đã cấu hình
    public CloudinaryService(Cloudinary cloudinary) {
        System.out.println("CloudinaryService initialized with Cloudinary bean: " + cloudinary);
        this.cloudinary = cloudinary;
    }

    public Map uploadFile(MultipartFile file) throws IOException {

        // Sử dụng uploader() của Cloudinary để tải file lên
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "auto" // Thiết lập loại tài nguyên (image, video, raw)
                        // "folder", "ten_thu_muc_cua_ban" // Có thể thêm thư mục lưu trữ nếu cần
                )
        );

        return uploadResult;
    }

    public String getImageUrl(Map uploadResult) {
        // Trích xuất secure URL ưu tiên, nếu không có thì fallback về url
        if (uploadResult == null) return null;
        Object secure = uploadResult.get("secure_url");
        if (secure != null) return secure.toString();
        Object url = uploadResult.get("url");
        return url != null ? url.toString() : null;
    }

    public Map deleteFile(String publicId) throws IOException {
        if (publicId == null || publicId.isEmpty()) {
            return null;
        }
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

}