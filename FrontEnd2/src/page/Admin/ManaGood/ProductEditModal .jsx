import React, { useState } from "react";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
const ProductEditModal = ({ product, closeModal, saveProductChanges }) => {
  const [formData, setFormData] = useState({
    goodName: product.goodName,
    amount: product.amount,
    price: product.price,
    image: product.image,
    brand: product.brand || "",
    category: product.category || "",
    specifications: product.specifications || "", // Thêm specifications vào formData
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

  const categories = [
    { id: 3, name: "Máy tính" },
    { id: 4, name: "Chuột" },
    { id: 5, name: "Bàn phím" },
  ];

  const brands = [
    { id: 3, name: "Dell" },
    { id: 4, name: "HP" },
    { id: 5, name: "Lenovo" },
    { id: 6, name: "Asus" },
  ];
  const handeOnclickSave = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("goodName", formData.goodName);
    formDataToSend.append("amount", formData.amount);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("brand", formData.brand);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("specifications", formData.specifications);

    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile); // Add the file here
    }
    try {
      const response = await request1.put(`admin/goods/${product.id}/`, formDataToSend, {
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

          <div>
            <label className="block text-sm font-semibold">Giá</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold">Hãng</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold">Thể loại</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Thông số kỹ thuật
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-md"
            />
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
