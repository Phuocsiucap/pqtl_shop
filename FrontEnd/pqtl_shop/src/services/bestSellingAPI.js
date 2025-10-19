import { apiCall1 } from './rootAPI';

// US6.1 - Lấy danh sách sản phẩm bán chạy theo thời gian
export const getBestSellingProducts = async (timeFilter) => {
  try {
    const response = await apiCall1('get', `/analytics/best-selling/?period=${timeFilter}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm bán chạy:", error);
    // Nếu đang dev thì có thể mock dữ liệu:
    return [
      // --- Nhóm Công nghệ ---
      { id: 1, name: 'iPhone 15 Pro Max', quantity: 245, revenue: 735000000, category: 'Điện thoại' },
      { id: 2, name: 'Samsung Galaxy S24', quantity: 198, revenue: 495000000, category: 'Điện thoại' },
      { id: 3, name: 'MacBook Air M3', quantity: 156, revenue: 546000000, category: 'Laptop' },
      { id: 4, name: 'AirPods Pro 2', quantity: 312, revenue: 187200000, category: 'Phụ kiện' },
      { id: 5, name: 'iPad Air', quantity: 134, revenue: 241200000, category: 'Máy tính bảng' },
      { id: 6, name: 'Apple Watch Series 9', quantity: 178, revenue: 160200000, category: 'Đồng hồ' },
      { id: 7, name: 'Sony WH-1000XM5', quantity: 223, revenue: 111500000, category: 'Tai nghe' },
      { id: 8, name: 'Dell XPS 15', quantity: 89, revenue: 267000000, category: 'Laptop' },

      // --- Nhóm Thực phẩm sạch ---
      { id: 9, name: 'Rau cải hữu cơ Đà Lạt', quantity: 320, revenue: 9600000, category: 'Thực phẩm sạch' },
      { id: 10, name: 'Cà chua bi organic', quantity: 285, revenue: 8550000, category: 'Thực phẩm sạch' },
      { id: 11, name: 'Thịt heo sạch CP', quantity: 210, revenue: 63000000, category: 'Thực phẩm sạch' },
      { id: 12, name: 'Trứng gà ta thả vườn', quantity: 450, revenue: 22500000, category: 'Thực phẩm sạch' },
      { id: 13, name: 'Cá hồi Na Uy tươi', quantity: 98, revenue: 147000000, category: 'Thực phẩm sạch' },
      { id: 14, name: 'Thịt bò Úc hữu cơ', quantity: 75, revenue: 225000000, category: 'Thực phẩm sạch' },
      { id: 15, name: 'Sữa tươi không đường Organic Valley', quantity: 340, revenue: 68000000, category: 'Thực phẩm sạch' },
      { id: 16, name: 'Gạo lứt huyết rồng', quantity: 190, revenue: 57000000, category: 'Thực phẩm sạch' },
      { id: 17, name: 'Mật ong rừng nguyên chất', quantity: 160, revenue: 96000000, category: 'Thực phẩm sạch' },
      { id: 18, name: 'Bơ sáp Đắk Lắk', quantity: 220, revenue: 66000000, category: 'Thực phẩm sạch' },
      { id: 19, name: 'Khoai lang mật hữu cơ', quantity: 250, revenue: 50000000, category: 'Thực phẩm sạch' },
      { id: 20, name: 'Dâu tây Đà Lạt', quantity: 130, revenue: 91000000, category: 'Thực phẩm sạch' },
      { id: 21, name: 'Cam sành Hậu Giang', quantity: 280, revenue: 56000000, category: 'Thực phẩm sạch' },
      { id: 22, name: 'Chuối cau lùn', quantity: 330, revenue: 49500000, category: 'Thực phẩm sạch' },
      { id: 23, name: 'Nước mắm nhĩ truyền thống Phan Thiết', quantity: 110, revenue: 77000000, category: 'Thực phẩm sạch' },
      { id: 24, name: 'Dưa lưới ruột vàng', quantity: 170, revenue: 102000000, category: 'Thực phẩm sạch' },
      { id: 25, name: 'Rau củ sấy lạnh mix', quantity: 240, revenue: 72000000, category: 'Thực phẩm sạch' },
      { id: 26, name: 'Sữa chua Hy Lạp homemade', quantity: 150, revenue: 45000000, category: 'Thực phẩm sạch' },
      { id: 27, name: 'Yến mạch nguyên cám nhập khẩu', quantity: 180, revenue: 72000000, category: 'Thực phẩm sạch' },
      { id: 28, name: 'Đậu phộng rang muối hữu cơ', quantity: 210, revenue: 42000000, category: 'Thực phẩm sạch' },
    ];
  }
};


  // US6.2 - Lấy số lượng đã bán
export const getProductSalesQuantity= async () => {
    try {
        const response = await apiCall1('get', '/analytics/sales-quantity/');
        return response.data;
    } catch (error) {

        console.error("Lỗi khi lấy số lượng đã bán:", error);
        // Nếu đang dev thì có thể mock dữ liệu:
        return 1234; // Ví dụ số lượng đã bán
    }
};

  // US6.3 - Lấy doanh thu theo sản phẩm
export const  getProductRevenue= async (startDate, endDate) => {
    try {
        const response = await apiCall1('get', '/analytics/revenue-by-product/', {
            params: { startDate, endDate }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy doanh thu theo sản phẩm:", error);
        // Nếu đang dev thì có thể mock dữ liệu:
        return 56789000; // Ví dụ doanh thu
    }
};

