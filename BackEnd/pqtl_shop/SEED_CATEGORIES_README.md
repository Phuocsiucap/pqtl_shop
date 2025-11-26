# Hướng dẫn Seed Categories vào MongoDB

## Cách 1: Sử dụng DatabaseSeeder (Tự động)

DatabaseSeeder sẽ tự động chạy khi ứng dụng Spring Boot khởi động và thêm 6 categories vào MongoDB nếu chưa tồn tại.

**6 Categories sẽ được thêm:**
1. Trái Cây Tươi (slug: trai-cay-tuoi)
2. Rau Ăn Hữu Cơ (slug: rau-an-huu-co)
3. Củ Quả & Gia Vị (slug: cu-qua-gia-vi)
4. Thịt & Trứng Sạch (slug: thit-trung-sach)
5. Hải Sản Tươi (slug: hai-san-tuoi)
6. Thực Phẩm Khô (slug: thuc-pham-kho)

## Cách 2: Sử dụng MongoDB Shell Script

Chạy script `seed-categories.js` bằng lệnh:

```bash
mongosh your-database-name < src/main/resources/seed-categories.js
```

Hoặc trong MongoDB Shell:

```javascript
use pqtl_shop;

db.categories.insertMany([
  { name: "Trái Cây Tươi", slug: "trai-cay-tuoi" },
  { name: "Rau Ăn Hữu Cơ", slug: "rau-an-huu-co" },
  { name: "Củ Quả & Gia Vị", slug: "cu-qua-gia-vi" },
  { name: "Thịt & Trứng Sạch", slug: "thit-trung-sach" },
  { name: "Hải Sản Tươi", slug: "hai-san-tuoi" },
  { name: "Thực Phẩm Khô", slug: "thuc-pham-kho" }
]);
```

## Kiểm tra kết quả

Sau khi seed, kiểm tra bằng cách:

1. **Qua MongoDB Compass hoặc mongo shell:**
   ```javascript
   db.categories.find().pretty()
   ```

2. **Qua API:**
   ```bash
   GET http://localhost:8080/api/v1/categories/
   ```

