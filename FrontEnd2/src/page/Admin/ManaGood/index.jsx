import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { FaEye, FaEdit, FaTrashAlt, FaSearch, FaPlus } from "react-icons/fa";
import ProductDetailModal from "./ProductDetailModal ";
import ProductEditModal from "./ProductEditModal ";
import AddProductModal from "./AddProductModal";
import ToastNotification from "../../../components/ToastNotification";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { request1, request, getFullImageUrl } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const ProductList = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState([]);

  // Toast & Confirm
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, productId: null, productName: "" });

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request1.get("v1/admin/goods/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
    } catch (e) {
      console.log("Lỗi khi lấy danh sách sản phẩm:", e);
      showToast("Không thể tải danh sách sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  }, [access_token]);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await request1.get("v1/categories/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const cats = response.data || [];
      setCategories(cats);
    } catch (e) {
      console.log("Lỗi khi lấy danh mục từ API:", e);
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
  }, [access_token]);

  // Initial load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Listen to URL changes and update category filter
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setCategoryFilter(decodeURIComponent(categoryFromUrl));
      setCurrentPage(1); // Reset to first page when filter changes
    } else {
      // If no category in URL, clear filter
      setCategoryFilter("");
    }
  }, [location.search, searchParams]);

  // Handle category filter change from dropdown
  const handleCategoryFilterChange = (category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
    // Update URL
    if (category) {
      setSearchParams({ category: encodeURIComponent(category) });
    } else {
      setSearchParams({});
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("all");
    setCurrentPage(1);
    setSearchParams({}); // Clear URL params
  };

  // Filter & Search
  useEffect(() => {
    let filtered = [...products];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category - exact match
    if (categoryFilter) {
      filtered = filtered.filter(product =>
        product.category && product.category.trim() === categoryFilter.trim()
      );
    }

    // Filter by status (if status field exists)
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => {
        // Giả sử status được tính dựa trên stockQuantity hoặc có field status
        if (statusFilter === "active") {
          return product.stockQuantity > 0;
        } else if (statusFilter === "inactive") {
          return product.stockQuantity === 0;
        }
        return true;
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Toast handler
  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const closeToast = () => {
    setToast({ isVisible: false, message: "", type: "success" });
  };

  // Modal handlers
  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const editProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setConfirmDelete({
      isOpen: true,
      productId: product.id,
      productName: product.name,
    });
  };

  const deleteProduct = async (id) => {
    try {
      const response = await request1.delete(`v1/admin/goods/${id}/`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      showToast("Xóa sản phẩm thành công", "success");
      setConfirmDelete({ isOpen: false, productId: null, productName: "" });
      fetchProducts(); // Refresh list
    } catch (e) {
      console.log("Lỗi khi xóa:", e);
      showToast("Xóa sản phẩm thất bại", "error");
    }
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setIsAddProductModalOpen(false);
  };

  const handleProductSaved = () => {
    closeModal();
    fetchProducts(); // Refresh list
    showToast("Thao tác thành công", "success");
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="p-6 w-full font-medium bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h2>
        <button
          onClick={() => setIsAddProductModalOpen(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <FaPlus /> Thêm sản phẩm
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
        </div>

        {/* Results count and Clear filter button */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {categoryFilter ? (
              <span>
                Hiển thị <strong>{currentProducts.length}</strong> / <strong>{filteredProducts.length}</strong> sản phẩm
                trong danh mục <strong className="text-blue-600">"{categoryFilter}"</strong>
              </span>
            ) : (
              <span>
                Hiển thị <strong>{currentProducts.length}</strong> / <strong>{filteredProducts.length}</strong> sản phẩm
              </span>
            )}
          </div>
          {(categoryFilter || searchTerm || statusFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Hình ảnh</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tên sản phẩm</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Danh mục</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Giá</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Số lượng</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50 border-b transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                    >
                      <td className="px-6 py-4">
                        <img
                          src={product.image ? getFullImageUrl(product.image) : "/placeholder.png"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">{product.name || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {product.category || "Chưa phân loại"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        {formatPrice(product.price || 0)}
                      </td>
                      <td className="px-6 py-4">{product.stockQuantity || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${(product.stockQuantity || 0) > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {(product.stockQuantity || 0) > 0 ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-3">
                          <button
                            onClick={() => viewProductDetails(product)}
                            className="text-blue-500 hover:text-blue-700 transform transition-all duration-200 hover:scale-110"
                            title="Xem chi tiết"
                          >
                            <FaEye size={18} />
                          </button>
                          <button
                            onClick={() => editProduct(product)}
                            className="text-yellow-500 hover:text-yellow-700 transform transition-all duration-200 hover:scale-110"
                            title="Chỉnh sửa"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-500 hover:text-red-700 transform transition-all duration-200 hover:scale-110"
                            title="Xóa"
                          >
                            <FaTrashAlt size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md transition-colors ${currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    Trước
                  </button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-4 py-2 rounded-md transition-colors ${currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md transition-colors ${currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isDetailModalOpen && (
        <ProductDetailModal product={selectedProduct} closeModal={closeModal} />
      )}
      {isEditModalOpen && (
        <ProductEditModal
          product={selectedProduct}
          closeModal={closeModal}
          onSave={handleProductSaved}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
      {isAddProductModalOpen && (
        <AddProductModal
          closeModal={closeModal}
          onSave={handleProductSaved}
          onError={(msg) => showToast(msg, "error")}
        />
      )}

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${confirmDelete.productName}"? Hành động này không thể hoàn tác.`}
        onConfirm={() => deleteProduct(confirmDelete.productId)}
        onCancel={() => setConfirmDelete({ isOpen: false, productId: null, productName: "" })}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default ProductList;


