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

// Trả về URL ảnh từ database
// Database đã lưu URL Cloudinary trực tiếp, không cần xử lý
function getFullImageUrl(path, fallback = 'https://via.placeholder.com/400x300?text=No+Image') {
    if (!path || typeof path !== 'string' || !path.trim()) {
        return fallback;
    }
    
    // Database lưu URL Cloudinary trực tiếp, return ngay
    return path;
}

export { request, request1, request2, token, getFullImageUrl };