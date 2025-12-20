import React, { useState, useEffect } from "react";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { getCategories } from "../../../api/category";
import { FaPlus, FaTimes, FaCloudUploadAlt, FaImage, FaExclamationCircle } from "react-icons/fa";

const AddProductModal = ({ closeModal, onSave, onError }) => {
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: [], type: "error" });
  // Initial State
  const [product, setProduct] = useState({
    goodName: "",
    brand: "",
    origin: "",
    description: "",
    specifications: "",
    certifications: [], // Placeholder for future implementation

    price: "",
    costPrice: "",
    discount: 0,
    stockQuantity: "", // Maps to 'amount' in backend if needed, but UI calls it Stock

    category: "",
    subCategory: "",

    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",

    isBestSeller: false,
    isSeasonal: false,
    isClearance: false,
    clearanceDiscount: 0,

    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

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

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!product.goodName?.trim()) newErrors.goodName = "Tên sản phẩm là bắt buộc";
    if (!product.category) newErrors.category = "Vui lòng chọn danh mục";
    if (!product.price || Number(product.price) <= 0) newErrors.price = "Giá bán không hợp lệ";
    if (!product.stockQuantity || Number(product.stockQuantity) < 0) newErrors.stockQuantity = "Số lượng kho không hợp lệ";
    if (!product.image) newErrors.image = "Ảnh chính là bắt buộc";

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

    // Hiển thị thông báo lỗi đẹp nếu có
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors);
      setToast({ show: true, message: errorMessages, type: "error" });
      return false;
    }

    return true;
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
  const saveNewProduct = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Upload ảnh chính lên Cloudinary trước
      let mainImageUrl = null;
      if (product.image) {
        mainImageUrl = await uploadImageToCloudinary(product.image);
      }

      // 2. Upload ảnh phụ lên Cloudinary
      let additionalImageUrls = [];
      for (const img of additionalImages) {
        const url = await uploadImageToCloudinary(img);
        additionalImageUrls.push(url);
      }

      // 3. Gửi JSON với URL ảnh đến API thêm sản phẩm
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
        additionalImages: additionalImageUrls,
      };

      const response = await request1.post("v1/admin/goods/", productPayload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.status === 200 || response.status === 201) {
        onSave && onSave();
        closeModal();
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50 p-4 overflow-y-auto">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-slide-in">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <FaExclamationCircle className="text-red-500 text-xl" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">Vui lòng nhập đầy đủ thông tin</h4>
              <div className="mt-2 text-sm text-gray-700">
                <ul className="list-disc list-inside space-y-1">
                  {toast.message.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Thêm Sản Phẩm Mới</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN (Main Content) */}
            <div className="lg:col-span-2 space-y-6">

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
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
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Main Image */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện <span className="text-red-500">*</span></label>
                    <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 transition-colors ${errors.image ? "border-red-400 bg-red-50" : "border-gray-300"}`}>
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
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh phụ (Gallery)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {additionalImagePreviews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square border rounded-md overflow-hidden group">
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
              </div>

              {/* Section C: Pricing & Inventory */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Giá & Tồn Kho</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Sidebar) */}
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
                      className={`w-full px-3 py-2 border rounded-md ${errors.category ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>

                  {/* Placeholder for Sub-category if needed later */}
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
                      name="isSeasonal"
                      checked={product.isSeasonal}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
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
            onClick={saveNewProduct}
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
                <FaPlus className="mr-2" /> Lưu sản phẩm
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddProductModal;
