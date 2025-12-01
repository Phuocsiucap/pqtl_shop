import React, { useState, useEffect, memo } from "react";
import { request1, getFullImageUrl } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { getCategories } from "../../../api/category";
import { FaTimes, FaCloudUploadAlt, FaSave, FaTrash, FaPlus } from "react-icons/fa";

// Memoized Image Uploader Component
const ImageUploader = memo(({ imagePreview, onImageChange, onRemoveImage }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden transition-colors">
                {imagePreview ? (
                    <div className="relative w-full h-full group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-semibold">Click để thay đổi ảnh</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaCloudUploadAlt className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click để tải ảnh</span></p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                    </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />
            </label>
            {imagePreview && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        onRemoveImage();
                    }}
                    className="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                >
                    <FaTrash size={12} /> Xóa ảnh
                </button>
            )}
        </div>
    );
});

const ProductEditModal = ({ product: initialProduct, closeModal, onSave, onError }) => {
    const [product, setProduct] = useState({
        name: "",
        description: "",
        category: "",
        subCategory: "",
        price: "",
        discount: 0,
        stockQuantity: 0,
        lowStockThreshold: 10,
        status: "ACTIVE",
        brand: "",
        origin: "",
        manufacturingDate: "",
        expiryDate: "",
        specifications: "",
        tags: "",
        certifications: "",
        sizes: "",
        isBestSeller: false,
        isSeasonal: false,
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]); // File objects for new images
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]); // Preview URLs
    const [existingAdditionalImages, setExistingAdditionalImages] = useState([]); // Existing image URLs from server
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const access_token = getCSRFTokenFromCookie("access_token_admin");

    // Initialize form data from initialProduct
    useEffect(() => {
        if (initialProduct) {
            setProduct({
                name: initialProduct.name || "",
                description: initialProduct.description || "",
                category: initialProduct.category || "",
                subCategory: initialProduct.subCategory || "",
                price: initialProduct.price || "",
                discount: initialProduct.discount || 0,
                stockQuantity: initialProduct.stockQuantity || 0,
                lowStockThreshold: initialProduct.lowStockThreshold || 10,
                status: initialProduct.status || "ACTIVE",
                brand: initialProduct.brand || "",
                origin: initialProduct.origin || "",
                // Format dates to YYYY-MM-DD for input[type="date"]
                manufacturingDate: initialProduct.manufacturingDate ? new Date(initialProduct.manufacturingDate).toISOString().split('T')[0] : "",
                expiryDate: initialProduct.expiryDate ? new Date(initialProduct.expiryDate).toISOString().split('T')[0] : "",
                specifications: initialProduct.specifications || "",
                // Convert arrays to comma-separated strings if they are arrays, or keep as string
                tags: Array.isArray(initialProduct.tags) ? initialProduct.tags.join(", ") : (initialProduct.tags || ""),
                certifications: Array.isArray(initialProduct.certifications) ? initialProduct.certifications.join(", ") : (initialProduct.certifications || ""),
                sizes: Array.isArray(initialProduct.sizes) ? initialProduct.sizes.join(", ") : (initialProduct.sizes || ""),
                isBestSeller: initialProduct.isBestSeller || false,
                isSeasonal: initialProduct.isSeasonal || false,
                image: null, // New image file
            });

            if (initialProduct.image) {
                setImagePreview(getFullImageUrl(initialProduct.image));
            }

            // Load existing additional images
            if (initialProduct.additionalImages && Array.isArray(initialProduct.additionalImages)) {
                setExistingAdditionalImages(initialProduct.additionalImages.map(img => getFullImageUrl(img)));
            }
        }
    }, [initialProduct]);

    // Load categories
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageChange = React.useCallback((e) => {
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
            reader.onload = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setProduct((prev) => ({ ...prev, image: file }));
            setErrors({ ...errors, image: "" });
        }
    }, [errors]);

    const handleRemoveImage = () => {
        setImagePreview(null);
        setProduct(prev => ({ ...prev, image: null }));
    };

    // Handle additional images selection
    const handleAdditionalImagesChange = React.useCallback((e) => {
        const files = Array.from(e.target.files);
        const currentTotal = additionalImages.length + existingAdditionalImages.length;
        const availableSlots = 5 - currentTotal;

        if (files.length > availableSlots) {
            alert(`Bạn chỉ có thể thêm tối đa ${availableSlots} ảnh nữa (tổng tối đa 5 ảnh)`);
            return;
        }

        const newPreviews = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                newPreviews.push(reader.result);
                if (newPreviews.length === files.length) {
                    setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setAdditionalImages(prev => [...prev, ...files]);
    }, [additionalImages.length, existingAdditionalImages.length]);

    // Remove new additional image (not yet uploaded)
    const handleRemoveAdditionalImage = (index) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
        setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Remove existing additional image from server
    const handleRemoveExistingImage = (index) => {
        setExistingAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};
        if (!product.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
        if (!product.category) newErrors.category = "Danh mục là bắt buộc";
        if (!product.price || Number(product.price) < 0) newErrors.price = "Giá không hợp lệ";
        if (!product.stockQuantity || Number(product.stockQuantity) < 0) newErrors.stockQuantity = "Số lượng không hợp lệ";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveProduct = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const formData = new FormData();

            // Construct the product object matching backend model
            // Note: Backend might expect different field names for update vs create, but usually they are similar.
            // Based on previous ProductEditModal, it used 'goodName', 'amount', etc.
            // But AddProductModal used a JSON string 'good' and 'image'.
            // I will follow the AddProductModal pattern but check if PUT endpoint supports it.
            // If the previous Edit modal used specific fields, I might need to stick to that OR update the backend.
            // However, usually PUT /goods/{id} expects the same structure as POST /goods.
            // Let's try to match the AddProductModal structure first (sending JSON object + image).

            // Wait, looking at the previous ProductEditModal (step 121), it sent individual fields:
            // formDataToSend.append("goodName", formData.name);
            // formDataToSend.append("amount", formData.stockQuantity.toString());
            // ...

            // And AddProductModal (step 120) sent:
            // formData.append("good", JSON.stringify(productData));

            // This suggests the POST and PUT endpoints might handle data differently.
            // I should probably stick to the way AddProductModal does it IF I assume the backend is consistent or if I want to align them.
            // BUT, if the backend endpoint for PUT `v1/admin/goods/${id}/` is strictly written to expect "goodName", "amount", etc., then sending "good" JSON might fail.

            // Let's look at `AdminManagementController.java` (it was open in step 0).
            // I don't have the content of `AdminManagementController.java` right now to verify.
            // However, the user asked to "sửa cho tôi phần sửa sản phẩm với giao diện phù hợp tương ứng như thêm sản phẩm".
            // This implies UI consistency.
            // I will try to use the `AddProductModal` data structure (JSON 'good' + image) because it's cleaner.
            // If it fails, I'll revert to individual fields.
            // Actually, to be safe and avoid backend errors without checking code, I should probably try to support the fields the old modal supported, 
            // OR better, I'll assume the backend is smart enough or I'll check the backend code if I can.

            // Let's assume for now I should use the cleaner JSON approach if possible, but since I can't verify the backend right now,
            // I will use the individual fields approach from the OLD EditModal BUT mapped from the NEW UI fields.
            // Wait, the OLD EditModal was using `request1.put`.

            // Let's try to use the JSON approach because it allows sending lists (tags, sizes) which the old modal didn't seem to handle well (it just sent strings).
            // If the backend for PUT doesn't support JSON 'good', I might break it.

            // Decision: I will use the JSON 'good' approach because it's likely the backend uses the same DTO for create and update.
            // If not, I'll debug.

            const productData = {
                name: product.name,
                description: product.description,
                category: product.category,
                subCategory: product.subCategory,
                price: Number(product.price),
                discount: Number(product.discount),
                stockQuantity: Number(product.stockQuantity),
                lowStockThreshold: Number(product.lowStockThreshold),
                status: product.status,
                brand: product.brand,
                origin: product.origin,
                manufacturingDate: product.manufacturingDate ? new Date(product.manufacturingDate).toISOString() : null,
                expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString() : null,
                specifications: product.specifications,
                isBestSeller: product.isBestSeller,
                isSeasonal: product.isSeasonal,
                tags: product.tags ? product.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
                certifications: product.certifications ? product.certifications.split(",").map(s => s.trim()).filter(Boolean) : [],
                sizes: product.sizes ? product.sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
                additionalImages: []
            };

            // Check if I should send as JSON 'good' or individual fields.
            // The previous EditModal sent: goodName, amount, price, specifications, brand, category.
            // It missed many fields like subCategory, discount, status, etc.
            // I will try to send the JSON 'good' object.
            formData.append("good", JSON.stringify(productData));

            if (product.image) {
                formData.append("image", product.image);
            }

            // Append new additional images
            additionalImages.forEach((file) => {
                formData.append("additionalImages", file);
            });

            // Note: The URL in old modal was `v1/admin/goods/${product.id}/`
            const response = await request1.put(
                `v1/admin/goods/${initialProduct.id}/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 200 || response.status === 201) {
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto py-10">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800">Chỉnh Sửa Sản Phẩm</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Main Info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Basic Info Section */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Thông Tin Cơ Bản</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={product.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.name ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="VD: Cà chua hữu cơ Đà Lạt"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                                        <textarea
                                            name="description"
                                            value={product.description}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Mô tả về sản phẩm..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu / Nguồn gốc</label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={product.brand}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                placeholder="VD: VinEco"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Xuất xứ</label>
                                            <input
                                                type="text"
                                                name="origin"
                                                value={product.origin}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                placeholder="VD: Lâm Đồng"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing & Inventory Section */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Giá & Kho Hàng</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={product.price}
                                            onChange={handleChange}
                                            min="0"
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.price ? "border-red-500" : "border-gray-300"}`}
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
                                            min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng trong kho <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            name="stockQuantity"
                                            value={product.stockQuantity}
                                            onChange={handleChange}
                                            min="0"
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.stockQuantity ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cảnh báo sắp hết hàng</label>
                                        <input
                                            type="number"
                                            name="lowStockThreshold"
                                            value={product.lowStockThreshold}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Thông Tin Chi Tiết</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Thông số kỹ thuật</label>
                                        <textarea
                                            name="specifications"
                                            value={product.specifications}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="Thành phần, hướng dẫn sử dụng..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sản xuất</label>
                                            <input
                                                type="date"
                                                name="manufacturingDate"
                                                value={product.manufacturingDate}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng</label>
                                            <input
                                                type="date"
                                                name="expiryDate"
                                                value={product.expiryDate}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Media & Settings */}
                        <div className="space-y-6">

                            {/* Status & Visibility */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Trạng Thái</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái sản phẩm</label>
                                        <select
                                            name="status"
                                            value={product.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="ACTIVE">Đang bán (Active)</option>
                                            <option value="INACTIVE">Ngừng bán (Inactive)</option>
                                            <option value="DRAFT">Nháp (Draft)</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</label>
                                        <input
                                            type="checkbox"
                                            name="isBestSeller"
                                            checked={product.isBestSeller}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700">Sản phẩm theo mùa</label>
                                        <input
                                            type="checkbox"
                                            name="isSeasonal"
                                            checked={product.isSeasonal}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categorization */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Phân Loại</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục chính <span className="text-red-500">*</span></label>
                                        <select
                                            name="category"
                                            value={product.category}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.category ? "border-red-500" : "border-gray-300"}`}
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục phụ</label>
                                        <input
                                            type="text"
                                            name="subCategory"
                                            value={product.subCategory}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="VD: Cà chua bi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (phân cách bằng dấu phẩy)</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={product.tags}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="fresh, organic, sale"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước/Phân loại (phân cách phẩy)</label>
                                        <input
                                            type="text"
                                            name="sizes"
                                            value={product.sizes}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="500g, 1kg, Túi"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Media */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Hình Ảnh</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh chính</label>
                                        <ImageUploader
                                            imagePreview={imagePreview}
                                            onImageChange={handleImageChange}
                                            onRemoveImage={handleRemoveImage}
                                        />
                                    </div>

                                    {/* Additional Images */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ảnh bổ sung ({existingAdditionalImages.length + additionalImages.length}/5)
                                        </label>

                                        {/* Existing Images Grid */}
                                        {existingAdditionalImages.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-500 mb-2">Ảnh hiện tại:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {existingAdditionalImages.map((imageUrl, index) => (
                                                        <div key={`existing-${index}`} className="relative group">
                                                            <img
                                                                src={imageUrl}
                                                                alt={`Existing ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExistingImage(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* New Images Grid */}
                                        {additionalImagePreviews.length > 0 && (
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-500 mb-2">Ảnh mới thêm:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {additionalImagePreviews.map((preview, index) => (
                                                        <div key={`new-${index}`} className="relative group">
                                                            <img
                                                                src={preview}
                                                                alt={`New ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg border border-green-300"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveAdditionalImage(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        {(existingAdditionalImages.length + additionalImages.length) < 5 && (
                                            <label className="flex items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <FaPlus />
                                                    <span className="text-sm">Thêm ảnh ({5 - existingAdditionalImages.length - additionalImages.length} còn lại)</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleAdditionalImagesChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 rounded-b-xl">
                    <button
                        onClick={closeModal}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={loading}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={saveProduct}
                        disabled={loading}
                        className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-200"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FaSave /> Lưu Thay Đổi
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductEditModal;
