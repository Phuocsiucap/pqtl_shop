import React, { useEffect, useState } from "react";
import { FaEye, FaFire, FaTrophy } from "react-icons/fa";
import { request1, request } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const BestSellerList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [timeRange, setTimeRange] = useState("month"); // week, month, year

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await request1.get("v1/admin/goods/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        
        // Sắp xếp theo số lượng đã bán từ API
        const sortedProducts = response.data
          .sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0));
        
        setProducts(sortedProducts);
      } catch (e) {
        console.log("Lỗi ", e);
      }
    };
    fetchBestSellers();
  }, [timeRange]);

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-500 text-2xl" />;
    if (index === 1) return <FaTrophy className="text-gray-400 text-2xl" />;
    if (index === 2) return <FaTrophy className="text-orange-600 text-2xl" />;
    return <span className="text-gray-600 font-bold">{index + 1}</span>;
  };

  return (
    <div className="p-6 w-full font-medium">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaFire className="text-orange-500 text-3xl" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Sản phẩm bán chạy
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeRange === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeRange === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeRange === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Năm nay
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <tr>
              <th className="px-6 py-4 text-center">Hạng</th>
              <th className="px-6 py-4 text-left">Hình ảnh</th>
              <th className="px-6 py-4 text-left">Tên sản phẩm</th>
              <th className="px-6 py-4 text-center">Đã bán</th>
              <th className="px-6 py-4 text-center">Tồn kho</th>
              <th className="px-6 py-4 text-center">Doanh thu</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {currentProducts.map((product, index) => {
              const actualIndex = indexOfFirstProduct + index;
              return (
                <tr
                  key={product.id}
                  className={`hover:bg-orange-50 border-b transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } ${actualIndex < 3 ? "font-semibold" : ""}`}
                >
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      {getRankIcon(actualIndex)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <img
                      src={`${request}${product.image}`}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-md shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {product.name}
                      {actualIndex < 3 && (
                        <FaFire className="text-orange-500 animate-pulse" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                      {product.soldQuantity || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">{product.stockQuantity}</td>
                  <td className="px-6 py-4 text-center text-blue-600 font-semibold">
                    {((product.soldQuantity || 0) * (product.price || 0)).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => viewProductDetails(product)}
                      className="text-blue-500 transform transition-all duration-300 hover:text-blue-700 hover:scale-110"
                    >
                      <FaEye className="text-xl" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="mt-4 flex justify-center items-center gap-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Trước
        </button>
        <span className="px-4 py-2 text-gray-700 font-semibold">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Sau
        </button>
      </div>

      {/* Modal Chi tiết */}
      {isDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Chi tiết sản phẩm</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <img
                src={`${request}${selectedProduct.image}`}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Tên sản phẩm:</p>
                  <p className="font-semibold">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Đã bán:</p>
                  <p className="font-semibold text-green-600">{selectedProduct.soldQuantity || 0} sản phẩm</p>
                </div>
                <div>
                  <p className="text-gray-600">Tồn kho:</p>
                  <p className="font-semibold">{selectedProduct.stockQuantity}</p>
                </div>
                <div>
                  <p className="text-gray-600">Doanh thu:</p>
                  <p className="font-semibold text-blue-600">
                    {((selectedProduct.soldQuantity || 0) * (selectedProduct.price || 0)).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BestSellerList;