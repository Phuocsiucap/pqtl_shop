import axios from "axios";

axios.defaults.withCredentials = true;
// Read backend URLs from Vite env variables (VITE_*) with sensible fallbacks
const BACKEND_URL = (import.meta.env && import.meta.env.VITE_BACKEND_URL) || 'http://127.0.0.1:8080';
const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || `${BACKEND_URL}/api`;

const request = `${BACKEND_URL.replace(/\/+$/,'')}/`;
const request1 = axios.create({
    baseURL: `${API_BASE.replace(/\/+$/,'')}/`,
});
const token = import.meta.env?.VITE_DEV_TOKEN || "";

// Trả về URL ảnh từ database
// Database đã lưu URL Cloudinary trực tiếp, không cần xử lý
function getFullImageUrl(path, fallback = 'https://via.placeholder.com/400x300?text=No+Image') {
    if (!path || typeof path !== 'string' || !path.trim()) {
        return fallback;
    }
    
    // Database lưu URL Cloudinary trực tiếp, return ngay
    return path;
}

export { request, request1, token, getFullImageUrl };