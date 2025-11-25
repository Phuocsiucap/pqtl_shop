# Hướng dẫn Module Quản lý Sản phẩm

## Tổng quan

Module quản lý sản phẩm đã được nâng cấp với đầy đủ tính năng CRUD, tìm kiếm, lọc, phân trang và tích hợp với danh mục từ MongoDB.

## Các tính năng chính

### 1. Trang Danh sách Sản phẩm (`/admin/managegood`)

**Các cột hiển thị:**
- Hình ảnh đại diện
- Tên sản phẩm
- Danh mục (lấy từ Category collection)
- Giá (định dạng VNĐ)
- Số lượng tồn kho
- Trạng thái (Đang bán/Ngừng bán)
- Hành động (Xem/Sửa/Xóa)

**Tính năng:**
- ✅ Phân trang: 10 sản phẩm mỗi trang
- ✅ Tìm kiếm theo tên sản phẩm
- ✅ Lọc theo danh mục (từ API)
- ✅ Lọc theo trạng thái
- ✅ Loading indicators
- ✅ Toast notifications
- ✅ Confirmation dialog khi xóa

### 2. Form Thêm mới Sản phẩm

**Các trường:**
- Tên sản phẩm (bắt buộc, có validation)
- Số lượng (bắt buộc, số dương)
- Giá bán (bắt buộc, số dương)
- Danh mục (dropdown động từ API, bắt buộc)
- Thương hiệu (dropdown)
- Mô tả/Thông số kỹ thuật
- Hình ảnh (upload, preview)

**Validation:**
- Tên sản phẩm không được để trống
- Số lượng và giá phải là số dương
- Danh mục bắt buộc phải chọn
- File ảnh phải là image và không quá 5MB

### 3. Form Chỉnh sửa Sản phẩm

- Tương tự form thêm mới
- Tự động điền dữ liệu hiện tại
- Cho phép cập nhật ảnh mới hoặc giữ ảnh cũ

### 4. Danh mục Truy cập Nhanh (Sidebar)

- Hiển thị 6 danh mục từ MongoDB
- Click vào danh mục sẽ tự động filter sản phẩm theo danh mục đó
- Có thể thu gọn/mở rộng

## API Endpoints

### Categories
- `GET /api/v1/categories/` - Lấy tất cả categories
- `GET /api/v1/categories/{id}` - Lấy category theo ID
- `GET /api/v1/categories/slug/{slug}` - Lấy category theo slug

### Products (Admin)
- `GET /api/v1/admin/goods/` - Lấy tất cả sản phẩm
- `POST /api/v1/admin/goods/` - Tạo sản phẩm mới
- `PUT /api/v1/admin/goods/{id}/` - Cập nhật sản phẩm
- `DELETE /api/v1/admin/goods/{id}/` - Xóa sản phẩm

## Luồng dữ liệu

### 1. Load Categories
```
Component Mount → API Call → Set State → Render Dropdown
```

### 2. Load Products
```
Component Mount → API Call → Filter/Search → Pagination → Render Table
```

### 3. Create/Update Product
```
User Input → Validation → FormData → API Call → Success Toast → Refresh List
```

### 4. Delete Product
```
Click Delete → Confirmation Dialog → API Call → Success Toast → Refresh List
```

### 5. Category Quick Access
```
Click Category in Sidebar → Navigate with Query Param → ProductList reads Query → Apply Filter
```

## Cấu trúc Files

```
FrontEnd2/src/
├── page/Admin/ManaGood/
│   ├── index.jsx              # Trang danh sách sản phẩm
│   ├── AddProductModal.jsx    # Modal thêm sản phẩm
│   ├── ProductEditModal.jsx   # Modal sửa sản phẩm
│   └── ProductDetailModal.jsx # Modal xem chi tiết
├── api/category/
│   └── index.js               # API service cho categories
├── components/
│   ├── ToastNotification.jsx  # Component toast
│   └── ConfirmDialog.jsx      # Component confirmation
└── Component/Layouts/AdminLayout/
    ├── CategorySidebar.jsx   # Sidebar danh mục
    └── Navbar2/index.jsx      # Sidebar chính (đã tích hợp CategorySidebar)
```

## Cách sử dụng

1. **Khởi động backend:**
   - DatabaseSeeder sẽ tự động thêm 6 categories vào MongoDB

2. **Truy cập trang quản lý:**
   - URL: `/admin/managegood`

3. **Thêm sản phẩm:**
   - Click "Thêm sản phẩm"
   - Điền form và chọn danh mục từ dropdown
   - Upload ảnh (tùy chọn)
   - Click "Lưu sản phẩm"

4. **Lọc sản phẩm:**
   - Sử dụng search box để tìm theo tên
   - Chọn danh mục từ dropdown filter
   - Hoặc click vào danh mục trong sidebar

5. **Sửa/Xóa sản phẩm:**
   - Click icon Sửa/Xóa trong cột Hành động
   - Xóa sẽ có confirmation dialog

## Lưu ý

- Categories được load động từ API, nếu API fail sẽ fallback về danh sách mặc định
- Tất cả các thao tác đều có loading state và error handling
- Toast notifications tự động ẩn sau 3 giây
- Pagination tự động reset về trang 1 khi filter/search thay đổi

