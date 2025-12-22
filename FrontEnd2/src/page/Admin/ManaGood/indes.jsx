import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrashAlt, FaTag, FaFilter, FaExclamationTriangle, FaLock } from "react-icons/fa";
import defaultImage from "../../../assets/images/placeholder.png";
import placeholderImg from "../../../assets/images/placeholder.png";
import ProductDetailModal from "./ProductDetailModal ";
import ProductEditModal from "./ProductEditModal ";
import AddProductModal from "./AddProductModal";
import { request1, request } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const ProductList = ({ userRole }) => {
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

  // Kiểm tra quyền STAFF
  const isStaff = userRole === "STAFF";

  // Hàm hiển thị thông báo cho STAFF
  const showStaffAlert = (action) => {
    alert(`Bạn không có quyền ${action} sản phẩm.\nVui lòng liên hệ Admin để thực hiện chức năng này.`);
  };

  // Multiple selection
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // Get status badges - hiển thị nhiều trạng thái
  const getStatusBadges = (product) => {
    const days = getDaysUntilExpiry(product.expiryDate);
    const badges = [];

    // Trạng thái thanh lý
    if (product.isClearance) {
      badges.push(
        <span key="clearance" className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
          Thanh lý -{product.clearanceDiscount}%
        </span>
      );
    }

    // Trạng thái theo mùa
    if (product.isSeasonal) {
      badges.push(
        <span key="seasonal" className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
          Theo mùa
        </span>
      );
    }

    // Trạng thái hết hạn
    if (days !== null && days < 0) {
      badges.push(
        <span key="expired" className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
          Hết hạn
        </span>
      );
    } else if (days !== null && days <= 7) {
      badges.push(
        <span key="nearexpiry" className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
          Còn {days} ngày
        </span>
      );
    } else if (days !== null && days <= 30) {
      badges.push(
        <span key="soonexpiry" className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
          Sắp hết hạn
        </span>
      );
    }

    // Trạng thái giảm giá (không phải thanh lý)
    if (!product.isClearance && product.discount > 0) {
      badges.push(
        <span key="discount" className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
          Giảm giá
        </span>
      );
    }

    // Nếu không có trạng thái nào
    if (badges.length === 0) {
      badges.push(
        <span key="normal" className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
          Bình thường
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {badges}
      </div>
    );
  };

  // Backward compatible function
  const getStatusBadge = (product) => {
    return getStatusBadges(product);
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
    if (isStaff) {
      showStaffAlert("sửa");
      return;
    }
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Hàm xóa sản phẩm
  const deleteProduct = async (id) => {
    if (isStaff) {
      showStaffAlert("xóa");
      return;
    }
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này?"
    );
    if (confirmDelete) {
      try {
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
      catch (e) {
        console.log("Lỗi ", e)
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

  // Multiple selection handlers
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
      setSelectAll(false);
    } else {
      setSelectedProducts(currentProducts.map(p => p.id));
      setSelectAll(true);
    }
  };

  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      const isCurrentlySelected = prev.includes(productId);

      if (isCurrentlySelected) {
        // Bỏ chọn sản phẩm
        const newSelected = prev.filter(id => id !== productId);
        setSelectAll(false); // Luôn bỏ selectAll khi bỏ chọn bất kỳ sản phẩm nào
        return newSelected;
      } else {
        // Chọn sản phẩm
        const newSelected = [...prev, productId];
        // Chỉ set selectAll = true nếu đã chọn đủ tất cả sản phẩm trên trang
        if (newSelected.length === currentProducts.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };

  // Bulk delete products
  const deleteMultipleProducts = async () => {
    if (isStaff) {
      showStaffAlert("xóa");
      return;
    }
    if (selectedProducts.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedProducts.length} sản phẩm đã chọn? Hành động này không thể hoàn tác.`
    );

    if (confirmDelete) {
      try {
        const response = await request1.post("v1/admin/goods/delete-multiple",
          { ids: selectedProducts },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        const result = response.data;
        alert(result.message || `Đã xóa ${result.successCount} sản phẩm`);
        setSelectedProducts([]);
        setSelectAll(false);
        // Refresh products list
        const refreshResponse = await request1.get("v1/admin/goods/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setProducts(refreshResponse.data);
      } catch (e) {
        console.log("Lỗi khi xóa nhiều sản phẩm:", e);
        alert("Xóa sản phẩm thất bại");
      }
    }
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

  // Hàm tải lại danh sách sản phẩm
  const refreshProducts = async () => {
    try {
      const response = await request1.get("v1/admin/goods/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setProducts(response.data);
    } catch (e) {
      console.log("Lỗi khi tải lại sản phẩm:", e);
    }
  };

  useEffect(() => {
    refreshProducts();
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
      case "all":
        matchStatus = true;
        break;
      case "seasonal":
        matchStatus = product.isSeasonal === true;
        break;
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
        matchStatus = !product.isClearance && !product.isSeasonal && (days === null || days > 30) && (!product.discount || product.discount === 0);
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
    if (isStaff) {
      showStaffAlert("đánh dấu thanh lý");
      return;
    }
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
    if (isStaff) {
      showStaffAlert("hủy thanh lý");
      return;
    }
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
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Danh sách sản phẩm ({filteredProducts.length})
          </h2>
          {selectedProducts.length > 0 && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              Đã chọn: {selectedProducts.length}
            </span>
          )}
        </div>
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
            <option value="seasonal">Theo mùa</option>
            <option value="clearance">Đang thanh lý</option>
            <option value="nearExpiry">Sắp hết hạn</option>
            <option value="expired">Đã hết hạn</option>
            <option value="sale">Đang giảm giá</option>
            <option value="normal">Bình thường</option>
          </select>

          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            + Thêm sản phẩm
          </button>

          {!isStaff && selectedProducts.length > 0 && (
            <button
              onClick={deleteMultipleProducts}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <FaTrashAlt /> Xóa nhiều sản phẩm ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-blue-500 text-white whitespace-nowrap">
            <tr>
              {!isStaff && (
                <th className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectAll && currentProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 cursor-pointer accent-blue-600 border-2 border-white rounded"
                      title="Chọn tất cả"
                    />
                    <span className="text-xs">Chọn</span>
                  </div>
                </th>
              )}
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
                  className={`hover:bg-gray-50 border-b ${selectedProducts.includes(product.id) ? "bg-blue-100" :
                      product.isClearance ? "bg-purple-50" :
                        days !== null && days <= 0 ? "bg-red-50" :
                          days !== null && days <= 7 ? "bg-orange-50" :
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                >
                  {!isStaff && (
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-5 h-5 cursor-pointer accent-blue-600 border-2 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <img
                      src={product.image || defaultImage}
                      alt={product.name || "Product"}
                      className="w-14 h-14 object-cover rounded-md bg-gray-100"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = defaultImage;
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${parseFloat(profitMargin) >= 30 ? "bg-green-100 text-green-700" :
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
                        className={`p-1 ${isStaff ? "text-gray-400 cursor-not-allowed" : "text-yellow-500 hover:text-yellow-700"}`}
                        title={isStaff ? "Liên hệ Admin để sửa" : "Chỉnh sửa"}
                      >
                        {isStaff ? <FaLock /> : <FaEdit />}
                      </button>
                      {!isStaff && (product.isClearance ? (
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
                      ))}
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className={`p-1 ${isStaff ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-700"}`}
                        title={isStaff ? "Liên hệ Admin để xóa" : "Xóa"}
                      >
                        {isStaff ? <FaLock /> : <FaTrashAlt />}
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
          onSave={refreshProducts}
        />
      )}
      {/* Modal Thêm Sản Phẩm */}
      {isAddProductModalOpen && (
        <AddProductModal
          closeModal={closeModal}
          onSave={refreshProducts}
        />
      )}
    </div>
  );
};

export default ProductList;
