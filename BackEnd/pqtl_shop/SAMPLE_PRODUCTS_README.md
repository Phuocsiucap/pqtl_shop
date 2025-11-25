# Dữ liệu Sản phẩm Mẫu

## Tổng quan

DatabaseSeeder đã được mở rộng để tự động thêm **24 sản phẩm mẫu** vào 6 categories khi ứng dụng khởi động (chỉ thêm nếu database chưa có sản phẩm nào).

## Phân bổ Sản phẩm theo Category

### 1. Trái Cây Tươi (4 sản phẩm)
- **Cam Sành Đà Lạt** - 45,000đ (giảm 5,000đ) - 100kg - Best Seller
- **Dâu Tây Đà Lạt** - 120,000đ (giảm 10,000đ) - 50 hộp - Best Seller, Seasonal
- **Nho Mẫu Đơn** - 85,000đ - 80kg
- **Xoài Cát Hòa Lộc** - 55,000đ (giảm 5,000đ) - 60kg - Seasonal

### 2. Rau Ăn Hữu Cơ (4 sản phẩm)
- **Rau Muống Hữu Cơ** - 25,000đ - 150 bó - Best Seller
- **Cải Bó Xôi Hữu Cơ** - 35,000đ (giảm 3,000đ) - 100 bó
- **Rau Cải Ngọt Hữu Cơ** - 28,000đ - 120 bó
- **Xà Lách Romaine Hữu Cơ** - 40,000đ (giảm 5,000đ) - 80 bó

### 3. Củ Quả & Gia Vị (4 sản phẩm)
- **Tỏi Lý Sơn** - 45,000đ - 200 túi - Best Seller
- **Hành Tím** - 30,000đ - 180kg
- **Gừng Tươi** - 35,000đ - 150kg
- **Ớt Hiểm** - 25,000đ - 100 túi

### 4. Thịt & Trứng Sạch (4 sản phẩm)
- **Thịt Heo Ba Chỉ Sạch** - 120,000đ (giảm 10,000đ) - 50kg - Best Seller
- **Thịt Bò Thăn** - 250,000đ (giảm 20,000đ) - 30kg
- **Trứng Gà Ta** - 45,000đ - 200 khay (10 quả/khay) - Best Seller
- **Thịt Gà Ta** - 180,000đ (giảm 15,000đ) - 25 con

### 5. Hải Sản Tươi (4 sản phẩm)
- **Tôm Sú Tươi** - 280,000đ (giảm 20,000đ) - 40kg - Best Seller
- **Cá Basa Fillet** - 85,000đ (giảm 5,000đ) - 60kg
- **Mực Tươi** - 120,000đ (giảm 10,000đ) - 35kg
- **Cua Biển** - 350,000đ (giảm 30,000đ) - 20kg - Best Seller

### 6. Thực Phẩm Khô (4 sản phẩm)
- **Gạo ST25** - 180,000đ (giảm 15,000đ) - 100 bao (5kg/bao) - Best Seller
- **Đậu Xanh Cà Mau** - 45,000đ - 150kg
- **Mè Đen** - 55,000đ (giảm 5,000đ) - 120 túi
- **Nấm Hương Khô** - 85,000đ - 80 túi

## Thông tin Sản phẩm

Mỗi sản phẩm bao gồm:
- **Tên sản phẩm**: Mô tả ngắn gọn
- **Mô tả**: Thông tin chi tiết về sản phẩm
- **Danh mục**: Một trong 6 categories
- **Giá**: Giá bán (VNĐ)
- **Giảm giá**: Số tiền giảm (nếu có)
- **Số lượng tồn kho**: Số lượng có sẵn
- **Thương hiệu**: Nguồn gốc/xuất xứ
- **Thông số kỹ thuật**: Chi tiết về sản phẩm, cách bảo quản
- **Best Seller**: Một số sản phẩm được đánh dấu là bán chạy
- **Seasonal**: Một số sản phẩm theo mùa

## Cách sử dụng

1. **Khởi động ứng dụng**: DatabaseSeeder sẽ tự động chạy khi Spring Boot khởi động
2. **Kiểm tra dữ liệu**: 
   - Truy cập `/admin/managegood` để xem danh sách sản phẩm
   - Hoặc gọi API `GET /api/v1/admin/goods/`
3. **Reset dữ liệu**: 
   - Xóa tất cả sản phẩm trong database
   - Khởi động lại ứng dụng để seed lại

## Lưu ý

- Seeder chỉ chạy nếu database **chưa có sản phẩm nào** (count = 0)
- Nếu đã có sản phẩm, seeder sẽ bỏ qua để tránh trùng lặp
- Tất cả sản phẩm có rating mặc định 4.5 và reviewCount = 0
- Image field để trống, có thể thêm sau qua admin panel

## Thêm sản phẩm mới

Để thêm sản phẩm mới, bạn có thể:
1. Sử dụng Admin Panel: `/admin/managegood` → "Thêm sản phẩm"
2. Gọi API: `POST /api/v1/admin/goods/`
3. Chỉnh sửa DatabaseSeeder và thêm vào method `seedProducts()`

