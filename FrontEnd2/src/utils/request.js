import axios from "axios";

axios.defaults.withCredentials = true;
const request = 'http://127.0.0.1:8080/';
const request2 = axios.create({
    baseURL: 'http://127.0.0.1:1234/',
});
const request1 = axios.create({
    baseURL: 'http://127.0.0.1:8080/api/',
});
const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2x1ZW4zMDAwQGdtYWlsLmNvbSIsImlhdCI6MTc2MTczMTMyMiwiZXhwIjoxNzYzNTMxMzIyfQ.A6NGi6jOg-itAFpYb6atniAcqH-M7G9OQOEOooLOEIE";

// Trả về URL đầy đủ cho ảnh từ database (Cloudinary)
// Database lưu trực tiếp URL từ Cloudinary (https://res.cloudinary.com/...)
function getFullImageUrl(path, fallback = 'https://via.placeholder.com/400x300?text=No+Image') {
    if (!path) {
        console.warn('getFullImageUrl: path is empty, returning fallback');
        return fallback;
    }
    
    // Path từ database đã là URL đầy đủ từ Cloudinary
    // Chỉ cần return trực tiếp
    if (typeof path === 'string' && path.trim()) {
        // Nếu là URL đầy đủ (http/https), return ngay
        if (/^https?:\/\//i.test(path)) {
            return path;
        }
        
        // Nếu là file local, thêm base URL
        if (path.startsWith('/')) {
            return `${request}${path.slice(1)}`;
        } else {
            return `${request}${path}`;
        }
    }
    
    return fallback;
}

export { request, request1, request2, token, getFullImageUrl };