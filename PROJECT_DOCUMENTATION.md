# 📋 TÀI LIỆU TỔNG HỢP DỰ ÁN PQTL SHOP

## Thông tin dự án
- **Tên dự án**: PQTL Shop - Hệ thống thương mại điện tử nông sản sạch
- **Repository**: pqtl_shop
- **Branch**: TuDev
- **Ngày cập nhật**: 27/11/2025

---

## 📁 CẤU TRÚC DỰ ÁN

```
DoAnChuyenNganh/
├── BackEnd/
│   └── pqtl_shop/           # Spring Boot Backend
│       ├── src/main/java/org/example/
│       │   ├── controller/  # API Controllers
│       │   ├── model/       # Data Models (MongoDB)
│       │   ├── repository/  # Database Repositories
│       │   └── service/     # Business Logic Services
│       └── pom.xml
│
├── FrontEnd2/               # React + Vite Frontend
│   ├── src/
│   │   ├── api/            # API Service calls
│   │   ├── Component/      # Reusable Components
│   │   ├── page/           # Page Components
│   │   │   ├── Admin/      # Admin pages
│   │   │   └── ...         # Customer pages
│   │   └── utils/          # Utilities
│   └── package.json
│
└── FrontEnd/                # Legacy React Frontend (không sử dụng)
```

---

## 🔧 CÔNG NGHỆ SỬ DỤNG

### Backend
- **Framework**: Spring Boot 3.3.5
- **Database**: MongoDB
- **Authentication**: JWT Token
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18+ với Vite
- **Styling**: TailwindCSS
- **State Management**: Redux
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: React Icons (Font Awesome)
- **HTTP Client**: Axios

---

## 📊 CÁC TÍNH NĂNG ĐÃ PHÁT TRIỂN

### 1. QUẢN LÝ SẢN PHẨM (Product Management)

#### 1.1 Model Product (`Product.java`)
```java
// Các trường chính
- id, name, description, category, image
- price (giá bán), costPrice (giá nhập/giá vốn)
- discount, finalPrice
- stockQuantity, soldQuantity
- brand, specifications
- rating, reviewCount

// Trường ngày sản xuất & hạn sử dụng (MỚI)
- manufacturingDate (LocalDate) - Ngày sản xuất (NSX)
- expiryDate (LocalDate) - Hạn sử dụng (HSD)
- shelfLifeDays (Integer) - Số ngày hạn sử dụng
- batchNumber (String) - Số lô sản xuất
- isExpired (Boolean) - Đã hết hạn
- isNearExpiry (Boolean) - Sắp hết hạn (<30 ngày)
- isClearance (Boolean) - Đang thanh lý
- clearanceDiscount (Double) - Phần trăm giảm giá thanh lý

// Methods helper
- checkExpired() - Kiểm tra đã hết hạn
- checkNearExpiry(days) - Kiểm tra sắp hết hạn
- getDaysUntilExpiry() - Số ngày còn lại
- getClearancePrice() - Giá sau thanh lý
- updateExpiryStatus() - Cập nhật trạng thái tự động
```

#### 1.2 API Endpoints quản lý sản phẩm
```
GET    /api/v1/admin/goods/           - Lấy tất cả sản phẩm
POST   /api/v1/admin/goods/           - Tạo sản phẩm mới
PUT    /api/v1/admin/goods/{id}/      - Cập nhật sản phẩm
DELETE /api/v1/admin/goods/{id}/      - Xóa sản phẩm
```

#### 1.3 Frontend Components
- `AddProductModal.jsx` - Form thêm sản phẩm (có NSX, HSD, số lô)
- `ProductEditModal.jsx` - Form sửa sản phẩm (có NSX, HSD, số lô)
- `ManaGood/index.jsx` - Trang quản lý sản phẩm

---

### 2. QUẢN LÝ GIÁ VỐN & LỢI NHUẬN (Cost & Profit Management)

#### 2.1 Model OrderItem (`OrderItem.java`)
```java
// Trường giá vốn
- costPrice (double) - Giá nhập của sản phẩm

// Method tính lợi nhuận
- getProfit() = (price - costPrice) * quantity
```

#### 2.2 Model Order (`Order.java`)
```java
// Trường tổng hợp
- totalCost (double) - Tổng chi phí
- totalProfit (double) - Tổng lợi nhuận
```

#### 2.3 API Endpoints báo cáo tài chính
```
GET /api/v1/admin/financial-report/           - Báo cáo tài chính tổng hợp
GET /api/v1/admin/products/profit-ranking/    - Xếp hạng sản phẩm theo lợi nhuận
GET /api/v1/admin/profit/                     - Thống kê lợi nhuận
GET /api/v1/admin/profit/top-products/        - Top sản phẩm lời cao/thấp
GET /api/v1/admin/profit/monthly/             - Lợi nhuận theo tháng
```

#### 2.4 Frontend Pages
- `FinancialReport/index.jsx` - Trang báo cáo tài chính
  - Summary cards (Doanh thu, Chi phí, Lợi nhuận, Biên lợi nhuận)
  - Charts (Line chart xu hướng, Bar chart so sánh)
  - Bảng top sản phẩm lời cao/thấp
  - Bảng chi tiết theo ngày
  - Export CSV

---

### 3. QUẢN LÝ HẠN SỬ DỤNG & THANH LÝ (Expiry & Clearance Management)

#### 3.1 API Endpoints hạn sử dụng
```
GET  /api/v1/admin/expiry/stats/          - Thống kê sản phẩm theo HSD
GET  /api/v1/admin/expiry/expired/        - Danh sách sản phẩm hết hạn
GET  /api/v1/admin/expiry/near-expiry/    - Danh sách sản phẩm sắp hết hạn
POST /api/v1/admin/expiry/remove-expired/ - Xóa/vô hiệu hóa sản phẩm hết hạn
```

#### 3.2 API Endpoints thanh lý
```
GET    /api/v1/admin/clearance/           - Danh sách sản phẩm thanh lý
POST   /api/v1/admin/clearance/{id}/      - Đánh dấu thanh lý
DELETE /api/v1/admin/clearance/{id}/      - Hủy thanh lý
POST   /api/v1/admin/clearance/auto-mark/ - Tự động đánh dấu thanh lý
GET    /api/v1/admin/products/batches/    - Danh sách theo lô
```

#### 3.3 Frontend Pages
- `ClearanceManager/index.jsx` - Trang quản lý thanh lý (Admin)
  - Thống kê: Tổng SP, Hết hạn, Sắp hết hạn, Còn hạn, Thanh lý
  - Tabs: Thống kê, Đã hết hạn, Sắp hết hạn, Đang thanh lý
  - Chức năng: Đánh dấu thanh lý, Tự động thanh lý, Xóa sản phẩm hết hạn
  - Export CSV

- `ClearanceProducts/index.jsx` - Trang sản phẩm thanh lý (Customer)
  - Hiển thị sản phẩm đang thanh lý
  - Badge giảm giá, countdown ngày hết hạn
  - Sắp xếp: Giảm giá nhiều, Giá thấp, Sắp hết hạn

---

### 4. QUẢN LÝ ĐƠN HÀNG (Order Management)

#### 4.1 API Endpoints
```
GET    /api/v1/admin/orders/              - Lấy tất cả đơn hàng
GET    /api/v1/admin/orders/{id}/         - Chi tiết đơn hàng
PUT    /api/v1/admin/orders/{id}/status/  - Cập nhật trạng thái
DELETE /api/v1/admin/orders/{id}/         - Xóa đơn hàng
GET    /api/v1/admin/orders/stats/        - Thống kê đơn hàng theo trạng thái
```

#### 4.2 Trạng thái đơn hàng
- Chờ xác nhận
- Đang chuẩn bị
- Đang giao
- Đã giao
- Đã hủy

---

### 5. QUẢN LÝ NGƯỜI DÙNG (User Management)

#### 5.1 API Endpoints
```
GET    /api/v1/admin/users/       - Lấy tất cả người dùng
PUT    /api/v1/admin/users/{id}/  - Cập nhật thông tin người dùng
DELETE /api/v1/admin/users/{id}/  - Xóa người dùng
```

---

### 6. SẢN PHẨM BÁN CHẠY (Best Seller)

#### 6.1 API Endpoints
```
GET /api/v1/admin/bestsellers/                    - Top sản phẩm bán chạy
GET /api/v1/admin/products/{id}/revenue/          - Doanh thu theo sản phẩm
```

#### 6.2 Frontend Page
- `BestSeller/index.jsx` - Trang sản phẩm bán chạy
  - Hiển thị top sản phẩm theo doanh số
  - Charts thống kê
  - Modal chi tiết với biểu đồ doanh thu
  - Hiển thị lợi nhuận (profit)
  - Export CSV

---

### 7. QUẢN LÝ VOUCHER

#### 7.1 API Endpoints
```
GET    /api/v1/admin/vouchers/       - Lấy tất cả voucher
POST   /api/v1/admin/vouchers/       - Tạo voucher
PUT    /api/v1/admin/vouchers/{id}/  - Cập nhật voucher
DELETE /api/v1/admin/vouchers/{id}/  - Xóa voucher
```

---

## 🎨 GIAO DIỆN NGƯỜI DÙNG

### Admin Layout
- Sidebar với menu:
  - Quản lý doanh thu
  - Quản lý người dùng
  - Quản lý sản phẩm
  - Quản lý đơn hàng
  - Quản lý Voucher
  - Bán chạy
  - Báo cáo lợi nhuận
  - Hạn SD & Thanh lý

### Customer Layout
- Header với:
  - Logo
  - Search bar
  - Button "Ưu đãi"
  - Button "Thanh lý" (mới)
  - User menu
  - Cart

### Product Detail Page
- Thông tin cơ bản
- Giá và giảm giá
- **Thông tin hạn sử dụng** (mới):
  - Ngày sản xuất
  - Hạn sử dụng (hiển thị số ngày còn lại)
  - Số lô
- **Badge thanh lý** (mới): Hiển thị nếu sản phẩm đang thanh lý
- Đánh giá và bình luận

---

## 📍 ROUTES

### Public Routes
```javascript
/                     - Trang chủ
/products/:id         - Chi tiết sản phẩm
/search               - Tìm kiếm
/category/:slug       - Danh mục
/cartshopping         - Giỏ hàng
/saleproduct          - Sản phẩm khuyến mãi
/clearance            - Sản phẩm thanh lý (MỚI)
/order                - Đơn hàng
/profile              - Tài khoản
/login                - Đăng nhập
/regester             - Đăng ký
```

### Admin Routes
```javascript
/admin/login          - Đăng nhập admin
/admin                - Dashboard doanh thu
/admin/manageuser     - Quản lý người dùng
/admin/managegood     - Quản lý sản phẩm
/admin/managebill     - Quản lý đơn hàng
/admin/managevoucher  - Quản lý voucher
/admin/bestseller     - Sản phẩm bán chạy
/admin/financial-report - Báo cáo tài chính (MỚI)
/admin/clearance      - Quản lý hạn SD & thanh lý (MỚI)
```

---

## 📦 FILES ĐÃ TẠO/SỬA ĐỔI

### Backend

#### Models
- `Product.java` - Thêm fields: manufacturingDate, expiryDate, shelfLifeDays, batchNumber, isExpired, isNearExpiry, isClearance, clearanceDiscount + helper methods
- `OrderItem.java` - Thêm field: costPrice + method getProfit()
- `Order.java` - Thêm fields: totalCost, totalProfit

#### Services
- `AdminService.java` - Thêm methods:
  - updateProduct (với NSX, HSD, số lô)
  - getExpiryStatistics()
  - getExpiredProducts()
  - getNearExpiryProducts()
  - markProductAsClearance()
  - unmarkProductAsClearance()
  - getClearanceProducts()
  - autoMarkClearanceForNearExpiryProducts()
  - removeExpiredProducts()
  - getProductsByBatch()
  - getFinancialReport()
  - getProductsProfitRanking()

- `OrderService.java` - Cập nhật createOrder để copy costPrice và tính profit

#### Controllers
- `AdminManagementController.java` - Thêm endpoints:
  - /expiry/stats/, /expiry/expired/, /expiry/near-expiry/, /expiry/remove-expired/
  - /clearance/, /clearance/{id}/, /clearance/auto-mark/
  - /products/batches/
  - /financial-report/
  - /products/profit-ranking/

### Frontend

#### Pages mới
- `page/Admin/FinancialReport/index.jsx` - Báo cáo tài chính
- `page/Admin/ClearanceManager/index.jsx` - Quản lý HSD & thanh lý
- `page/ClearanceProducts/index.jsx` - Sản phẩm thanh lý (customer)

#### Pages cập nhật
- `page/Admin/ManaGood/AddProductModal.jsx` - Thêm NSX, HSD, số lô
- `page/Admin/ManaGood/ProductEditModal.jsx` - Thêm NSX, HSD, số lô
- `page/Admin/BestSeller/index.jsx` - Thêm hiển thị profit
- `page/Product/ProductDetail.jsx` - Thêm hiển thị HSD, badge thanh lý

#### Components cập nhật
- `Component/Layouts/AdminLayout/Navbar2/index.jsx` - Thêm menu items
- `Component/Layouts/DefaultLayout/Header/Navbar/index.jsx` - Thêm button "Thanh lý"

#### Routes
- `page/index.jsx` - Thêm routes mới

#### API Services
- `api/profit/index.js` - API calls cho profit (mới)

---

## 🔑 CÔNG THỨC TÍNH TOÁN

### Lợi nhuận sản phẩm
```
profit = (price - costPrice) * quantity
```

### Biên lợi nhuận (Profit Margin)
```
profitMargin = (totalProfit / totalRevenue) * 100%
```

### Giá thanh lý
```
clearancePrice = finalPrice * (1 - clearanceDiscount / 100)
```

### Số ngày còn lại đến hết hạn
```
daysUntilExpiry = expiryDate - today
```

---

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN

### Backend
```bash
cd BackEnd/pqtl_shop
mvn spring-boot:run
# Server chạy tại: http://localhost:8080
```

### Frontend
```bash
cd FrontEnd2
npm install
npm run dev
# App chạy tại: http://localhost:8888
```

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Database Migration**: Các sản phẩm cũ cần được cập nhật thêm các trường mới (manufacturingDate, expiryDate, costPrice, v.v.)

2. **Existing Orders**: Đơn hàng cũ sẽ không có dữ liệu costPrice và profit. Chỉ đơn hàng mới sẽ có đầy đủ thông tin.

3. **Automatic Expiry Update**: Trạng thái hết hạn (isExpired, isNearExpiry) được cập nhật tự động khi gọi API thống kê.

4. **Chart.js**: Cần đảm bảo đã cài đặt `chart.js` và `react-chartjs-2`:
   ```bash
   npm install chart.js react-chartjs-2
   ```

5. **Image URL Handling**: Đã xử lý trường hợp image null/undefined/empty để tránh lỗi "undefined" trong URL.

---

## 👤 THÔNG TIN NGƯỜI PHÁT TRIỂN

- **Repository Owner**: Phuocsiucap
- **Branch**: TuDev
- **Last Updated**: November 27, 2025

---

*Tài liệu này được tạo tự động để hỗ trợ maintenance và phát triển tiếp dự án.*
