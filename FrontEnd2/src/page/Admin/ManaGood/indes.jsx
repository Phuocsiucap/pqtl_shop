import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrashAlt, FaTag, FaFilter, FaExclamationTriangle } from "react-icons/fa";
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
  const [filterStatus, setFilterStatus] = useState("all"); // all, clearance, nearExpiry, expired, normal
  const [searchTerm, setSearchTerm] = useState("");
  const productsPerPage = 10;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  // Get days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    return Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  };

  // Get status badge
  const getStatusBadge = (product) => {
    const days = getDaysUntilExpiry(product.expiryDate);
    
    if (product.isClearance) {
      return <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">Thanh lý -{product.clearanceDiscount}%</span>;
    }
    if (days !== null && days < 0) {
      return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">Hết hạn</span>;
    }
    if (days !== null && days <= 7) {
      return <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">Còn {days} ngày</span>;
    }
    if (days !== null && days <= 30) {
      return <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">Sắp hết hạn</span>;
    }
    if (product.discount > 0) {
      return <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Giảm giá</span>;
    }
    return <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">Bình thường</span>;
  };

  // Calculate profit margin
  const getProfitMargin = (price, costPrice) => {
    if (!costPrice || costPrice === 0) return null;
    return ((price - costPrice) / price * 100).toFixed(1);
  };

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
        const response = await request1.delete(`v1/admin/goods/${id}/`, {
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
        const response = await request1.get("v1/admin/goods/", {
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

  // Filter products
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const days = getDaysUntilExpiry(product.expiryDate);
    let matchStatus = true;
    
    switch (filterStatus) {
      case "clearance":
        matchStatus = product.isClearance === true;
        break;
      case "nearExpiry":
        matchStatus = days !== null && days > 0 && days <= 30;
        break;
      case "expired":
        matchStatus = days !== null && days <= 0;
        break;
      case "sale":
        matchStatus = product.discount > 0;
        break;
      case "normal":
        matchStatus = !product.isClearance && (days === null || days > 30) && (!product.discount || product.discount === 0);
        break;
      default:
        matchStatus = true;
    }
    
    return matchSearch && matchStatus;
  });

  // Xác định các sản phẩm được hiển thị trên trang hiện tại
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Xử lý chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Mark as clearance
  const markAsClearance = async (productId, discount) => {
    try {
      await request1.post(`v1/admin/clearance/${productId}/?discount=${discount}`, {}, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      // Refresh products
      const response = await request1.get("v1/admin/goods/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setProducts(response.data);
      alert("Đánh dấu thanh lý thành công!");
    } catch (e) {
      console.log("Lỗi ", e);
      alert("Lỗi khi đánh dấu thanh lý");
    }
  };

  // Unmark clearance
  const unmarkClearance = async (productId) => {
    try {
      await request1.delete(`v1/admin/clearance/${productId}/`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      // Refresh products
      const response = await request1.get("v1/admin/goods/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setProducts(response.data);
      alert("Hủy thanh lý thành công!");
    } catch (e) {
      console.log("Lỗi ", e);
      alert("Lỗi khi hủy thanh lý");
    }
  };

  return (
    <div className="p-6 w-full font-medium">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Danh sách sản phẩm ({filteredProducts.length})
        </h2>
        <div className="flex gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="clearance">🏷️ Đang thanh lý</option>
            <option value="nearExpiry">⏰ Sắp hết hạn</option>
            <option value="expired">❌ Đã hết hạn</option>
            <option value="sale">💰 Đang giảm giá</option>
            <option value="normal">✅ Bình thường</option>
          </select>
          
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-blue-500 text-white whitespace-nowrap">
            <tr>
              <th className="px-4 py-3 text-left">Hình ảnh</th>
              <th className="px-4 py-3 text-left">Tên sản phẩm</th>
              <th className="px-4 py-3 text-center">SL</th>
              <th className="px-4 py-3 text-right">Giá bán</th>
              <th className="px-4 py-3 text-right">Giá nhập</th>
              <th className="px-4 py-3 text-center">Lợi nhuận</th>
              <th className="px-4 py-3 text-center">Giảm giá</th>
              <th className="px-4 py-3 text-center">HSD</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {currentProducts.map((product, index) => {
              const days = getDaysUntilExpiry(product.expiryDate);
              const profitMargin = getProfitMargin(product.price, product.costPrice);
              
              return (
              <tr
                key={product.id}
                className={`hover:bg-gray-50 border-b ${
                  product.isClearance ? "bg-purple-50" :
                  days !== null && days <= 0 ? "bg-red-50" :
                  days !== null && days <= 7 ? "bg-orange-50" :
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-4 py-3">
                  <img
                    src={product.image ? `${request}${product.image}` : "https://via.placeholder.com/56x56?text=No+Image"}
                    alt={product.name || "Product"}
                    className="w-14 h-14 object-cover rounded-md bg-gray-100"
                    onError={(e) => { 
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = "https://via.placeholder.com/56x56?text=No+Image"; 
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-[200px]">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={product.stockQuantity <= 10 ? "text-red-600 font-bold" : ""}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {product.isClearance ? (
                    <div>
                      <span className="line-through text-gray-400 text-xs">{formatCurrency(product.price)}</span>
                      <br />
                      <span className="text-purple-600">{formatCurrency(product.price * (1 - (product.clearanceDiscount || 0) / 100))}</span>
                    </div>
                  ) : product.discount > 0 ? (
                    <div>
                      <span className="line-through text-gray-400 text-xs">{formatCurrency(product.price)}</span>
                      <br />
                      <span className="text-red-600">{formatCurrency(product.price - product.discount)}</span>
                    </div>
                  ) : (
                    formatCurrency(product.price)
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {product.costPrice ? formatCurrency(product.costPrice) : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {profitMargin ? (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      parseFloat(profitMargin) >= 30 ? "bg-green-100 text-green-700" :
                      parseFloat(profitMargin) >= 15 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {profitMargin}%
                    </span>
                  ) : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {product.discount > 0 ? (
                    <span className="text-green-600 font-medium">-{formatCurrency(product.discount)}</span>
                  ) : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-4 py-3 text-center text-xs">
                  {product.expiryDate ? (
                    <div>
                      <p>{product.expiryDate}</p>
                      {days !== null && (
                        <p className={
                          days <= 0 ? "text-red-600 font-bold" :
                          days <= 7 ? "text-red-500" :
                          days <= 30 ? "text-orange-500" :
                          "text-green-500"
                        }>
                          {days <= 0 ? "Hết hạn" : `${days} ngày`}
                        </p>
                      )}
                    </div>
                  ) : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(product)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => viewProductDetails(product)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => editProduct(product)}
                      className="text-yellow-500 hover:text-yellow-700 p-1"
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                    {product.isClearance ? (
                      <button
                        onClick={() => unmarkClearance(product.id)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title="Hủy thanh lý"
                      >
                        <FaTag />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const discount = prompt("Nhập % giảm giá thanh lý (1-90):", "30");
                          if (discount && !isNaN(discount) && discount >= 1 && discount <= 90) {
                            markAsClearance(product.id, parseFloat(discount));
                          }
                        }}
                        className="text-purple-500 hover:text-purple-700 p-1"
                        title="Đánh dấu thanh lý"
                      >
                        <FaTag />
                      </button>
                    )}
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Xóa"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
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
