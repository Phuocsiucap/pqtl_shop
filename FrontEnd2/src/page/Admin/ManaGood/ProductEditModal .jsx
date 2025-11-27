import React, { useState } from "react";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
const ProductEditModal = ({ product, closeModal, saveProductChanges }) => {
  const [formData, setFormData] = useState({
    goodName: product.name || product.goodName || "",           // Map from backend 'name' field
    amount: product.stockQuantity || product.amount || 0,        // Map from backend 'stockQuantity' field
    price: product.price || 0,
    costPrice: product.costPrice || 0,
    image: product.image,
    brand: product.brand || "",
    category: product.category || "",
    specifications: product.specifications || "",
    manufacturingDate: product.manufacturingDate || "",
    expiryDate: product.expiryDate || "",
    batchNumber: product.batchNumber || "",
    imageFile: null,
  });
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        imageFile: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveProductChanges({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(formData.imageFile);
    } else {
      saveProductChanges(formData);
    }
  };

  // Danh sách thể loại nông sản
  const categories = [
    { id: 1, name: "Trái Cây Tươi" },
    { id: 2, name: "Rau Ăn Lá Hữu Cơ" },
    { id: 3, name: "Củ Quả & Gia Vị" },
    { id: 4, name: "Thịt & Trứng Sạch" },
    { id: 5, name: "Hải Sản Tươi" },
    { id: 6, name: "Thực Phẩm Khô" },
    { id: 7, name: "Ngũ Cốc" },
    { id: 8, name: "Đậu & Hạt" },
  ];

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
  const handeOnclickSave = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("goodName", formData.goodName);  // Backend expects 'goodName' and maps to 'name'
    formDataToSend.append("amount", formData.amount);      // Backend expects 'amount' and maps to 'stockQuantity'
    formDataToSend.append("price", formData.price);
    formDataToSend.append("costPrice", formData.costPrice);
    formDataToSend.append("brand", formData.brand);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("specifications", formData.specifications);
    
    // Add new fields for expiry management
    if (formData.manufacturingDate) {
      formDataToSend.append("manufacturingDate", formData.manufacturingDate);
    }
    if (formData.expiryDate) {
      formDataToSend.append("expiryDate", formData.expiryDate);
    }
    if (formData.batchNumber) {
      formDataToSend.append("batchNumber", formData.batchNumber);
    }

    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile);
    }
    try {
      const response = await request1.put(`v1/admin/goods/${product.id}/`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${access_token}`, // Đảm bảo token đúng
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // Cho phép gửi cookie
      });
      console.log(response);
      if (response.status === 200) {
        alert("Sửa thành công");
        closeModal();
      }
    } catch (e) {
      alert("Lỗi khi sửa");
      console.log("Lỗi ", e);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[600px]">
        <h3 className="text-2xl font-semibold mb-6">Chỉnh sửa sản phẩm</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">Tên sản phẩm</label>
            <input
              type="text"
              name="goodName"
              value={formData.goodName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"

            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Số lượng</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold">Giá bán</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold">Giá nhập</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold">Vùng miền / Nhà cung cấp</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Chọn vùng miền</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold">Danh mục nông sản</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Thông tin sản phẩm / Đặc điểm
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Nhập thông tin về nguồn gốc, cách bảo quản, đặc điểm nông sản..."
            />
          </div>

          {/* Ngày sản xuất, Hạn sử dụng, Số lô */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold">Ngày sản xuất (NSX)</label>
              <input
                type="date"
                name="manufacturingDate"
                value={formData.manufacturingDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold">Hạn sử dụng (HSD)</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold">Số lô</label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
                placeholder="VD: LOT001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">Ảnh sản phẩm</label>
            <input
              type="file"
              name="imageFile"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-md"
            />
            {formData.imageFile && (
              <p className="mt-2 text-gray-600">
                Chọn file: {formData.imageFile.name}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              onClick={() => handeOnclickSave()}
            >
              Lưu
            </button>
            <button
              onClick={closeModal}
              className="bg-red-600 text-white px-6 py-2 rounded-md ml-4 hover:bg-red-700 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;

