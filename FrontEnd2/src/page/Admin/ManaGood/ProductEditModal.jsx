import React, { useState, useEffect } from "react";
import { request1, request } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { getCategories } from "../../../api/category";

const ProductEditModal = ({ product, closeModal, onSave, onError }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    stockQuantity: product?.stockQuantity || "",
    price: product?.price || "",
    costPrice: product?.costPrice || "",
    description: product?.description || "",
    specifications: product?.specifications || "",
    brand: product?.brand || "",
    category: product?.category || "",
    manufacturingDate: product?.manufacturingDate || "",
    expiryDate: product?.expiryDate || "",
    batchNumber: product?.batchNumber || "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(
    product?.image ? `${request}${product.image}` : null
  );
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  // Danh sách brands
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

  // Validation
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }
    
    if (!formData.stockQuantity || formData.stockQuantity === "" || parseInt(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = "Số lượng phải là số dương";
    }
    
    if (!formData.price || formData.price === "" || parseFloat(formData.price) <= 0) {
      newErrors.price = "Giá bán phải là số dương";
    }
    
    if (formData.costPrice && parseFloat(formData.costPrice) < 0) {
      newErrors.costPrice = "Giá nhập phải là số không âm";
    }
    
    if (formData.costPrice && formData.price && parseFloat(formData.costPrice) >= parseFloat(formData.price)) {
      newErrors.costPrice = "Giá nhập phải nhỏ hơn giá bán";
    }
    
    if (!formData.category || formData.category === "") {
      newErrors.category = "Vui lòng chọn danh mục";
    }
    
    // Validate ngày sản xuất và hạn sử dụng
    if (formData.manufacturingDate && formData.expiryDate) {
      if (new Date(formData.manufacturingDate) >= new Date(formData.expiryDate)) {
        newErrors.expiryDate = "Hạn sử dụng phải sau ngày sản xuất";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, image: "File phải là hình ảnh" });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Kích thước file không được vượt quá 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData({ ...formData, image: file });
      setErrors({ ...errors, image: "" });
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Handle submit
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("goodName", formData.name);
      formDataToSend.append("amount", formData.stockQuantity.toString());
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("costPrice", formData.costPrice ? formData.costPrice.toString() : "0");
      formDataToSend.append("specifications", formData.specifications || formData.description || "");
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("category", formData.category);
      
      // Thêm ngày sản xuất và hạn sử dụng
      if (formData.manufacturingDate) {
        formDataToSend.append("manufacturingDate", formData.manufacturingDate);
      }
      if (formData.expiryDate) {
        formDataToSend.append("expiryDate", formData.expiryDate);
      }
      if (formData.batchNumber) {
        formDataToSend.append("batchNumber", formData.batchNumber);
      }

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await request1.put(`v1/admin/goods/${product.id}/`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        onSave && onSave();
      }
    } catch (e) {
      console.error("Lỗi khi cập nhật sản phẩm:", e);
      const errorMsg = e.response?.data?.error || "Cập nhật sản phẩm thất bại";
      onError && onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa Sản phẩm</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Image Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình ảnh sản phẩm
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Kéo thả ảnh vào đây hoặc click để chọn</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload-edit"
                />
                <label
                  htmlFor="image-upload-edit"
                  className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Chọn ảnh mới
                </label>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên sản phẩm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.stockQuantity ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.stockQuantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá nhập (VNĐ)
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.costPrice ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.costPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>
                )}
                {formData.price && formData.costPrice && parseFloat(formData.costPrice) < parseFloat(formData.price) && (
                  <p className="mt-1 text-sm text-green-600">
                    Lợi nhuận: {(parseFloat(formData.price) - parseFloat(formData.costPrice)).toLocaleString('vi-VN')} ₫ 
                    ({(((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100).toFixed(1)}%)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thương hiệu
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
            </div>
            
            {/* Ngày sản xuất và Hạn sử dụng */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-3">📅 Thông tin sản xuất & Hạn sử dụng</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày sản xuất (NSX)
                  </label>
                  <input
                    type="date"
                    name="manufacturingDate"
                    value={formData.manufacturingDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hạn sử dụng (HSD)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    min={formData.manufacturingDate || undefined}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.expiryDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                  {formData.expiryDate && (
                    <p className={`mt-1 text-sm ${
                      new Date(formData.expiryDate) < new Date()
                        ? 'text-red-600 font-bold'
                        : Math.ceil((new Date(formData.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30
                          ? 'text-orange-600'
                          : 'text-green-600'
                    }`}>
                      {new Date(formData.expiryDate) < new Date()
                        ? '⚠️ ĐÃ HẾT HẠN'
                        : `Còn ${Math.ceil((new Date(formData.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} ngày`
                      }
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lô sản xuất
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: LOT20241127"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả / Thông số kỹ thuật
              </label>
              <textarea
                name="description"
                value={formData.description || formData.specifications}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    description: e.target.value,
                    specifications: e.target.value 
                  });
                }}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={closeModal}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xử lý...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;

