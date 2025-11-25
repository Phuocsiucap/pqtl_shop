import { request1 } from '../../utils/request';
import { getCSRFTokenFromCookie } from '../../Component/Token/getCSRFToken';

// Lấy danh sách categories từ API
export const getCategories = async () => {
  try {
    const access_token = getCSRFTokenFromCookie("access_token_admin");

    const headers = {
      'Content-Type': 'application/json',
    };

    if (access_token) {
      headers.Authorization = `Bearer ${access_token}`;
    }

    const response = await request1.get('v1/categories/', {
      headers,
      withCredentials: Boolean(access_token),
    });

    return response.data || [];
  } catch (error) {
    console.warn('Không thể lấy categories từ API, sử dụng dữ liệu mặc định:', error);
    // Fallback: trả về danh sách mặc định (6 categories chính)
    return [
      { id: "1", name: "Trái Cây Tươi" },
      { id: "2", name: "Rau Ăn Hữu Cơ" },
      { id: "3", name: "Củ Quả & Gia Vị" },
      { id: "4", name: "Thịt & Trứng Sạch" },
      { id: "5", name: "Hải Sản Tươi" },
      { id: "6", name: "Thực Phẩm Khô" },
    ];
  }
};

// Export dữ liệu tĩnh để tương thích ngược (6 categories chính)
export const Category = [
  { id: "1", name: "Trái Cây Tươi" },
  { id: "2", name: "Rau Ăn Hữu Cơ" },
  { id: "3", name: "Củ Quả & Gia Vị" },
  { id: "4", name: "Thịt & Trứng Sạch" },
  { id: "5", name: "Hải Sản Tươi" },
  { id: "6", name: "Thực Phẩm Khô" },
];
