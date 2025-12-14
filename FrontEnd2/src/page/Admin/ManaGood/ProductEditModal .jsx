import React, { useState, useEffect } from "react";
import { request1, request } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { getCategories } from "../../../api/category";
import { FaPlus, FaTimes, FaCloudUploadAlt } from "react-icons/fa";

const ProductEditModal = ({ product: initialProduct, closeModal, onSave, onError }) => {
  // Initial State - mapped from initialProduct prop
  const [product, setProduct] = useState({
    goodName: initialProduct?.name || "",
    brand: initialProduct?.brand || "",
    origin: initialProduct?.origin || "",
    description: initialProduct?.description || "",
    specifications: initialProduct?.specifications || "",
    certifications: initialProduct?.certifications || [],

    price: initialProduct?.price || "",
    costPrice: initialProduct?.costPrice || "",
    discount: initialProduct?.discount || 0,
    stockQuantity: initialProduct?.stockQuantity || "",

    category: initialProduct?.category || "",
    subCategory: initialProduct?.subCategory || "",

    batchNumber: initialProduct?.batchNumber || "",
    manufacturingDate: initialProduct?.manufacturingDate || "",
    expiryDate: initialProduct?.expiryDate || "",

    isBestSeller: initialProduct?.isBestSeller || false,
    isSeasonal: initialProduct?.isSeasonal || false,
    isClearance: initialProduct?.isClearance || false,
    clearanceDiscount: initialProduct?.clearanceDiscount || 0,

    image: null, // New image file if changed
  });

  // Image Previews
  const [imagePreview, setImagePreview] = useState(
    initialProduct?.image
      ? (initialProduct.image.startsWith('http') ? initialProduct.image : `${request}${initialProduct.image}`)
      : null
  );

  const [additionalImages, setAdditionalImages] = useState([]); // New files to upload
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]); // Previews for new files

  // Existing additional images from backend
  const [existingAdditionalImages, setExistingAdditionalImages] = useState(
    initialProduct?.additionalImages || []
  );

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const access_token = getCSRFTokenFromCookie("access_token_admin");

  // Load Categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
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

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors(prev => ({ ...prev, image: "File phải là hình ảnh" }));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setProduct(prev => ({ ...prev, image: file }));
      if (errors.image) setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setAdditionalImages(prev => [...prev, ...files]);
      setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!product.goodName?.trim()) newErrors.goodName = "Tên sản phẩm là bắt buộc";
    if (!product.category) newErrors.category = "Vui lòng chọn danh mục";
    if (!product.price || Number(product.price) <= 0) newErrors.price = "Giá bán không hợp lệ";
    if (!product.stockQuantity || Number(product.stockQuantity) < 0) newErrors.stockQuantity = "Số lượng kho không hợp lệ";

    if (product.isClearance) {
      const disc = Number(product.clearanceDiscount);
      if (disc <= 0 || disc > 100) newErrors.clearanceDiscount = "Giảm giá thanh lý phải từ 1-100%";
    }

    if (product.manufacturingDate && product.expiryDate) {
      if (new Date(product.expiryDate) <= new Date(product.manufacturingDate)) {
        newErrors.expiryDate = "Hạn sử dụng phải sau ngày sản xuất";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await request1.post("v1/upload", formData, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    return response.data.url;
  };

  // Submit
  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Upload ảnh chính mới lên Cloudinary nếu có thay đổi
      let mainImageUrl = null;
      if (product.image) {
        // Có file ảnh mới, upload lên Cloudinary
        mainImageUrl = await uploadImageToCloudinary(product.image);
      } else if (imagePreview) {
        // Giữ nguyên URL ảnh cũ (đã là URL từ trước)
        mainImageUrl = imagePreview;
      }

      // 2. Upload ảnh phụ mới lên Cloudinary
      let allAdditionalImageUrls = [...existingAdditionalImages]; // Giữ các ảnh cũ
      for (const img of additionalImages) {
        const url = await uploadImageToCloudinary(img);
        allAdditionalImageUrls.push(url);
      }

      // 3. Gửi JSON với URL ảnh đến API sửa sản phẩm
      const productPayload = {
        name: product.goodName,
        stockQuantity: product.stockQuantity,
        price: product.price,
        costPrice: product.costPrice,
        discount: product.discount,

        category: product.category,
        brand: product.brand,
        origin: product.origin,

        description: product.description,
        specifications: product.specifications,

        batchNumber: product.batchNumber,
        manufacturingDate: product.manufacturingDate,
        expiryDate: product.expiryDate,

        isBestSeller: product.isBestSeller,
        isSeasonal: product.isSeasonal,
        isClearance: product.isClearance,
        clearanceDiscount: product.isClearance ? product.clearanceDiscount : null,

        image: mainImageUrl,
        additionalImages: allAdditionalImageUrls,
      };

      const response = await request1.put(`v1/admin/goods/${initialProduct.id}/`, productPayload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        onSave && onSave();
        closeModal();
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Chỉnh Sửa Sản Phẩm</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT COLUMN */}
            <div className="space-y-6">

              {/* Section A: General Info */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Thông Tin Chung</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="goodName"
                      value={product.goodName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.goodName ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Nhập tên sản phẩm..."
                    />
                    {errors.goodName && <p className="text-red-500 text-xs mt-1">{errors.goodName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                      <input
                        type="text"
                        name="brand"
                        value={product.brand}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="VD: Vinamilk, Đà Lạt..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Xuất xứ</label>
                      <input
                        type="text"
                        name="origin"
                        value={product.origin}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="VD: Việt Nam"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm / Đặc điểm</label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      placeholder="Mô tả chi tiết về sản phẩm..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thông số kỹ thuật</label>
                    <textarea
                      name="specifications"
                      value={product.specifications}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                      placeholder="Thành phần, hướng dẫn sử dụng..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Section B: Media */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Hình Ảnh</h3>

                {/* Main Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện <span className="text-red-500">*</span></label>
                  <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-gray-50 transition-colors ${errors.image ? "border-red-400 bg-red-50" : "border-gray-300"}`}>
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setImagePreview(null);
                            setProduct(prev => ({ ...prev, image: null }));
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                        <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Nhấn để tải ảnh lên</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh phụ (Gallery)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Existing Additional Images */}
                    {existingAdditionalImages.map((src, idx) => (
                      <div key={`exist-${idx}`} className="relative aspect-square border rounded-md overflow-hidden group">
                        <img src={src.startsWith('http') ? src : `${request}${src}`} alt={`Sub ${idx}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}

                    {/* New Additional Images */}
                    {additionalImagePreviews.map((src, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square border rounded-md overflow-hidden group">
                        <img src={src} alt={`Sub ${idx}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveAdditionalImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                      <FaPlus className="text-gray-400" />
                      <span className="text-xs text-gray-400 mt-1">Thêm</span>
                      <input type="file" multiple accept="image/*" onChange={handleAdditionalImagesChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Section C: Pricing & Inventory */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Giá & Tồn Kho</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.price ? "border-red-500" : "border-gray-300"}`}
                      placeholder="0"
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá nhập (VNĐ)</label>
                    <input
                      type="number"
                      name="costPrice"
                      value={product.costPrice}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (VNĐ)</label>
                    <input
                      type="number"
                      name="discount"
                      value={product.discount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={product.stockQuantity}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.stockQuantity ? "border-red-500" : "border-gray-300"}`}
                      placeholder="0"
                    />
                    {errors.stockQuantity && <p className="text-red-500 text-xs mt-1">{errors.stockQuantity}</p>}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">

              {/* Section D: Classification */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Phân Loại</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục chính <span className="text-red-500">*</span></label>
                    <select
                      name="category"
                      value={product.category}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 ${errors.category ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>
                </div>
              </div>

              {/* Section E: Batch & Expiry */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Lô & Hạn Dùng</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lô (Batch No.)</label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={product.batchNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="VD: L001-2023"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sản xuất</label>
                    <input
                      type="date"
                      name="manufacturingDate"
                      value={product.manufacturingDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={product.expiryDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md ${errors.expiryDate ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                  </div>
                </div>
              </div>

              {/* Section F: Status & Flags */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Trạng Thái</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={product.isBestSeller}
                      onChange={handleChange}
                      className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">Sản phẩm bán chạy (Best Seller)</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isSeasonal"
                      checked={product.isSeasonal}
                      onChange={handleChange}
                      className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700">Sản phẩm theo mùa</span>
                  </label>

                  <div className="pt-2 border-t mt-2">
                    <label className="flex items-center space-x-3 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        name="isClearance"
                        checked={product.isClearance}
                        onChange={handleChange}
                        className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-red-600 font-medium">Hàng thanh lý (Clearance)</span>
                    </label>

                    {product.isClearance && (
                      <div className="ml-8 animate-fadeIn">
                        <label className="block text-sm text-gray-600 mb-1">Giảm giá thanh lý (%)</label>
                        <input
                          type="number"
                          name="clearanceDiscount"
                          value={product.clearanceDiscount}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md ${errors.clearanceDiscount ? "border-red-500" : "border-gray-300"}`}
                          placeholder="VD: 50"
                          min="1"
                          max="100"
                        />
                        {errors.clearanceDiscount && <p className="text-red-500 text-xs mt-1">{errors.clearanceDiscount}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
          <button
            onClick={closeModal}
            disabled={loading}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <FaPlus className="mr-2" /> Lưu thay đổi
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductEditModal;
