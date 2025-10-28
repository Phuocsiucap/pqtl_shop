import React, { useState } from "react";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const AddProductModal = ({ closeModal }) => {
  const [newProduct, setNewProduct] = useState({
    goodName: "",
    amount: "",
    price: "",
    specifications: "",
    brand: "",
    category: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  // Danh sách thương hiệu và thể loại
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

  // Hàm lưu sản phẩm mới
  const saveNewProduct = async () => {
    if (
      newProduct.goodName &&
      newProduct.amount &&
      newProduct.price &&
      newProduct.specifications &&
      newProduct.brand &&
      newProduct.category
    ) {
      const formData = new FormData();
      formData.append("good", JSON.stringify({
        goodName: newProduct.goodName,
        amount: newProduct.amount,
        price: newProduct.price,
        specifications: newProduct.specifications,
        brand: newProduct.brand,
        category: newProduct.category,
      }));
      
      // Thêm ảnh vào FormData
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }
      try {
        const response = await request1.post(
          "admin/goods/",
          formData,
          {
            headers: {
              Authorization: `Bearer ${access_token}`, // Đảm bảo token đúng
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true, // Cho phép gửi cookie
          }
        );
        console.log(response);
        if(response.status===200){
          alert("Thêm thành công");
          closeModal();
        }
      } catch (e) {
        console.log("Lỗi ", e);
        alert("Thêm thất bại");
      }
    } else {
      alert("Vui lòng điền đầy đủ thông tin!");
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
              <label className="block mb-2">Tên sản phẩm</label>
              <input
                type="text"
                value={newProduct.goodName}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, goodName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Số lượng</label>
              <input
                type="number"
                value={newProduct.amount}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, amount: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Nhập số lượng"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Giá bán</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Nhập giá bán"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Tính năng đặc biệt</label>
              <input
                type="text"
                value={newProduct.specifications}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    specifications: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Nhập tính năng đặc biệt"
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Thương hiệu</label>
              <select
                value={newProduct.brand}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, brand: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand, index) => (
                  <option key={index} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block mb-2">Thể loại</label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Chọn thể loại</option>
                {categories.map((category, index) => (
                  <option key={index} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={closeModal}
              className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500"
            >
              Hủy
            </button>
            <button
              onClick={saveNewProduct}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
