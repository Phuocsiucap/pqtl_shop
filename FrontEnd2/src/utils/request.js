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

// Trả về URL đầy đủ cho ảnh. Nếu `path` đã là URL tuyệt đối (http/https) thì giữ nguyên,
// nếu là đường dẫn nội bộ trên server thì thêm tiền tố `request`.
function getFullImageUrl(path, fallback = '/placeholder.png') {
    if (!path) return fallback;
    try {
        if (/^https?:\/\//i.test(path)) return path;
        return `${request}${path}`;
    } catch (e) {
        return fallback;
    }
}

export { request, request1, request2, token, getFullImageUrl };