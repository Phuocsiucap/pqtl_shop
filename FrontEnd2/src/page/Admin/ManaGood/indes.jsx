import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import Image from "../../../assets/images/Product_1.png";
import ProductDetailModal from "./ProductDetailModal ";
import ProductEditModal from "./ProductEditModal ";
import AddProductModal from "./AddProductModal";
import { request1,request } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  // Hàm mở modal xem chi tiết sản phẩm
  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  // Hàm mở modal chỉnh sửa sản phẩm
  const editProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Hàm xóa sản phẩm
  const deleteProduct = async(id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này?"
    );
    if (confirmDelete) {
      try{
        const response = await request1.delete(`admin/goods/${id}/`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(response)
        alert("Xóa thành công");
        setProducts(products.filter((product) => product.id !== id));
      }
      catch(e){
        console.log("Lỗi ",e)
        alert("Xóa thất bại")
      }
    }
  };

  // Hàm đóng modal
  const closeModal = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setIsAddProductModalOpen(false);
  };

  // Hàm lưu thay đổi chỉnh sửa sản phẩm
  const saveProductChanges = (updatedProduct) => {
    setProducts(
      products.map((product) =>
        product.id === selectedProduct.id
          ? { ...product, ...updatedProduct }
          : product
      )
    );
    closeModal();
  };
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("admin/goods/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(response)
        setProducts(response.data)
      } catch (e) {
        console.log("Lỗi ", e);
      }
    };
    fetch();
  }, []);
  // Xác định các sản phẩm được hiển thị trên trang hiện tại
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Xử lý chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Tính tổng số trang
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="p-6 w-full font-medium">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Danh sách sản phẩm
        </h2>
        <button
          onClick={() => setIsAddProductModalOpen(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-blue-500 text-white whitespace-nowrap">
            <tr>
              <th className="px-6 py-4 text-left">Hình ảnh</th>
              <th className="px-6 py-4 text-left">Tên sản phẩm</th>
              <th className="px-5 py-4 text-left">Số lượng</th>
              <th className="px-5 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {currentProducts.map((product, index) => (
              <tr
                key={product.id}
                className={`hover:bg-gray-100 border-b ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="px-6 py-4">
                  <img
                    src={`${request}${product.image}`}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </td>
                <td className="px-6 py-4">{product.goodName}</td>
                <td className="px-6 py-4">{product.amount}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => viewProductDetails(product)}
                    className="text-blue-500 mr-4 transform transition-all duration-300 hover:text-blue-700 hover:scale-110"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => editProduct(product)}
                    className="text-yellow-500 mr-4 transform transition-all duration-300 hover:text-yellow-700 hover:scale-110"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-500 transform transition-all duration-300 hover:text-red-700 hover:scale-110"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 bg-gray-300 text-gray-700 rounded-md"
        >
          Prev
        </button>
        <span className="px-4 py-2 mx-2 text-gray-700">{`Trang ${currentPage} / ${totalPages}`}</span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-2 bg-gray-300 text-gray-700 rounded-md"
        >
          Next
        </button>
      </div>

      {isDetailModalOpen && (
        <ProductDetailModal product={selectedProduct} closeModal={closeModal} />
      )}
      {isEditModalOpen && (
        <ProductEditModal
          product={selectedProduct}
          closeModal={closeModal}
          saveProductChanges={saveProductChanges}
        />
      )}
      {/* Modal Thêm Sản Phẩm */}
      {isAddProductModalOpen && <AddProductModal closeModal={closeModal} />}
    </div>
  );
};

export default ProductList;
