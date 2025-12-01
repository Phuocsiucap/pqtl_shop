import React, { useState, useEffect } from "react";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { getCategories } from "../../../api/category";

const AddProductModal = ({ closeModal, onSave, onError }) => {
  const [newProduct, setNewProduct] = useState({
    goodName: "",
    amount: "",
    price: "",
    costPrice: "",
    specifications: "",
    brand: "",
    category: "",
    manufacturingDate: "",
    expiryDate: "",
    batchNumber: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
        // Fallback to default categories
        setCategories([
          { id: "1", name: "Trái Cây Tươi" },
          { id: "2", name: "Rau Ăn Hữu Cơ" },
          { id: "3", name: "Củ Quả & Gia Vị" },
          { id: "4", name: "Thịt & Trứng Sạch" },
          { id: "5", name: "Hải Sản Tươi" },
          { id: "6", name: "Thực Phẩm Khô" },
        ]);
      }
    };
    loadCategories();
  }, []);  
  // Danh sách vùng miền/nhà cung cấp nông sản
  const brands = [
    { id: 1, name: "Đà Lạt" },
    { id: 2, name: "Lâm Đồng" },
    { id: 3, name: "Đồng Tháp" },
    { id: 4, name: "Tiền Giang" },
    { id: 5, name: "Bến Tre" },
    { id: 6, name: "Cần Thơ" },
    { id: 7, name: "An Giang" },
    { id: 8, name: "Hữu Cơ Việt" },
    { id: 9, name: "Nông Trại Xanh" },
    { id: 10, name: "Khác" },
  ];
  // Hàm xử lý xem trước ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result); // Cập nhật URL ảnh xem trước
      };
      reader.readAsDataURL(file);
      setNewProduct({ ...newProduct, image: file });
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    
    if (!newProduct.goodName || newProduct.goodName.trim() === "") {
      newErrors.goodName = "Tên sản phẩm là bắt buộc";
    }
    
    if (!newProduct.amount || newProduct.amount === "" || parseInt(newProduct.amount) < 0) {
      newErrors.amount = "Số lượng phải là số dương";
    }
    
    if (!newProduct.price || newProduct.price === "" || parseFloat(newProduct.price) <= 0) {
      newErrors.price = "Giá bán phải là số dương";
    }
    
    if (!newProduct.costPrice || newProduct.costPrice === "" || parseFloat(newProduct.costPrice) < 0) {
      newErrors.costPrice = "Giá nhập phải là số không âm";
    }
    
    if (parseFloat(newProduct.costPrice) >= parseFloat(newProduct.price)) {
      newErrors.costPrice = "Giá nhập phải nhỏ hơn giá bán";
    }
    
    if (!newProduct.category || newProduct.category === "") {
      newErrors.category = "Vui lòng chọn danh mục";
    }
    
    // Validate ngày sản xuất và hạn sử dụng
    if (newProduct.manufacturingDate && newProduct.expiryDate) {
      if (new Date(newProduct.manufacturingDate) >= new Date(newProduct.expiryDate)) {
        newErrors.expiryDate = "Hạn sử dụng phải sau ngày sản xuất";
      }
    }
    
    if (newProduct.expiryDate && new Date(newProduct.expiryDate) < new Date()) {
      newErrors.expiryDate = "Hạn sử dụng không thể là ngày trong quá khứ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm lưu sản phẩm mới
  const saveNewProduct = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      // Map frontend fields to backend Product model fields
      const productData = {
        name: newProduct.goodName,                    // goodName -> name
        stockQuantity: parseInt(newProduct.amount),   // amount -> stockQuantity
        price: parseFloat(newProduct.price),
        costPrice: parseFloat(newProduct.costPrice),
        specifications: newProduct.specifications,
        brand: newProduct.brand,
        category: newProduct.category,
        manufacturingDate: newProduct.manufacturingDate || null,
        expiryDate: newProduct.expiryDate || null,
        batchNumber: newProduct.batchNumber || null,
      };
      formData.append("good", JSON.stringify(productData));
      
      // Thêm ảnh vào FormData
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }
      
      const response = await request1.post(
        "v1/admin/goods/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "multipart/form-data",
          },
         
        }
      );
      console.log(response);
      if (response.status === 200 || response.status === 201) {
        // Thông báo thành công
        alert("Thêm sản phẩm thành công!");
        
        // Reset form data
        setNewProduct({
          goodName: "",
          amount: "",
          price: "",
          costPrice: "",
          specifications: "",
          brand: "",
          category: "",
          manufacturingDate: "",
          expiryDate: "",
          batchNumber: "",
          image: null,
        });
        setImagePreview(null);
        setErrors({});
        
        onSave && onSave();
      }
    } catch (e) {
      console.error("Lỗi khi thêm sản phẩm:", e);
      const errorMsg = e.response?.data?.error || "Thêm sản phẩm thất bại";
      onError && onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[1000px] flex">
        {/* Phần xem trước ảnh */}
        <div className="flex flex-col items-center justify-start mr-6">
          <div className="mb-4 w-[150px] h-[150px] border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-400 text-sm">Chưa có ảnh</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm"
          />
        </div>

        {/* Nội dung modal */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">Thêm Sản Phẩm</h2>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newProduct.goodName}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, goodName: e.target.value });
                  if (errors.goodName) setErrors({ ...errors, goodName: "" });
                }}
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.goodName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.goodName && (
                <p className="mt-1 text-sm text-red-600">{errors.goodName}</p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Số lượng <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={newProduct.amount}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, amount: e.target.value });
                  if (errors.amount) setErrors({ ...errors, amount: "" });
                }}
                min="0"
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, price: e.target.value });
                  if (errors.price) setErrors({ ...errors, price: "" });
                }}
                min="0"
                step="1000"
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Giá nhập (VNĐ) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={newProduct.costPrice}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, costPrice: e.target.value });
                  if (errors.costPrice) setErrors({ ...errors, costPrice: "" });
                }}
                min="0"
                step="1000"
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.costPrice ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.costPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>
              )}
              {newProduct.price && newProduct.costPrice && parseFloat(newProduct.costPrice) < parseFloat(newProduct.price) && (
                <p className="mt-1 text-sm text-green-600">
                  Lợi nhuận: {(parseFloat(newProduct.price) - parseFloat(newProduct.costPrice)).toLocaleString('vi-VN')} ₫ 
                  ({(((parseFloat(newProduct.price) - parseFloat(newProduct.costPrice)) / parseFloat(newProduct.price)) * 100).toFixed(1)}%)
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block mb-2">Thông tin sản phẩm / Đặc điểm</label>
              <textarea
                value={newProduct.specifications}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    specifications: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Nhập thông tin về nguồn gốc, cách bảo quản, đặc điểm nông sản..."
                rows="3"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Vùng miền / Nhà cung cấp</label>
              <select
                value={newProduct.brand}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, brand: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Chọn vùng miền</option>
                {brands.map((brand, index) => (
                  <option key={index} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Danh mục <span className="text-red-500">*</span></label>
              <select
                value={newProduct.category}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: "" });
                }}
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>
            
            {/* Ngày sản xuất và Hạn sử dụng */}
            <div className="col-span-2 border-t pt-4 mt-2">
              <h3 className="font-semibold text-gray-700 mb-3">📅 Thông tin sản xuất & Hạn sử dụng</h3>
            </div>
            
            <div className="col-span-1">
              <label className="block mb-2">Ngày sản xuất (NSX)</label>
              <input
                type="date"
                value={newProduct.manufacturingDate}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, manufacturingDate: e.target.value })
                }
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="col-span-1">
              <label className="block mb-2">Hạn sử dụng (HSD)</label>
              <input
                type="date"
                value={newProduct.expiryDate}
                onChange={(e) => {
                  setNewProduct({ ...newProduct, expiryDate: e.target.value });
                  if (errors.expiryDate) setErrors({ ...errors, expiryDate: "" });
                }}
                min={newProduct.manufacturingDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.expiryDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
              {newProduct.expiryDate && (
                <p className={`mt-1 text-sm ${
                  Math.ceil((new Date(newProduct.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}>
                  Còn {Math.ceil((new Date(newProduct.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} ngày
                </p>
              )}
            </div>
            
            <div className="col-span-1">
              <label className="block mb-2">Số lô sản xuất</label>
              <input
                type="text"
                value={newProduct.batchNumber}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, batchNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="VD: LOT20241127"
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={closeModal}
              disabled={loading}
              className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={saveNewProduct}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                "Lưu sản phẩm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
