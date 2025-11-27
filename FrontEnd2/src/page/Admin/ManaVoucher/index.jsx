import React, { useEffect, useState, useCallback } from "react";
import { FaEye, FaEdit, FaTrashAlt, FaSearch, FaPlus, FaToggleOn, FaToggleOff } from "react-icons/fa";
import VoucherDetailModal from "./VoucherDetailModal";
import VoucherEditModal from "./VoucherEditModal";
import AddVoucherModal from "./AddVoucherModal";
import ToastNotification from "../../../components/ToastNotification";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddVoucherModalOpen, setIsAddVoucherModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 10;

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");

  // Toast & Confirm
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, voucherId: null, voucherTitle: "" });

  // Fetch vouchers
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request1.get("v1/admin/vouchers/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setVouchers(response.data || []);
      setFilteredVouchers(response.data || []);
    } catch (e) {
      console.log("Lỗi khi lấy danh sách voucher:", e);
      showToast("Không thể tải danh sách voucher", "error");
    } finally {
      setLoading(false);
    }
  }, [access_token]);

  // Initial load
  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Filter & Search
  useEffect(() => {
    let filtered = [...vouchers];

    // Search by title or code
    if (searchTerm) {
      filtered = filtered.filter(voucher =>
        voucher.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(voucher => {
        if (statusFilter === "active") {
          return voucher.isActive && voucher.isValid;
        } else if (statusFilter === "inactive") {
          return !voucher.isActive;
        } else if (statusFilter === "expired") {
          return !voucher.isValid && voucher.isActive;
        }
        return true;
      });
    }

    // Filter by discount type
    if (discountTypeFilter !== "all") {
      filtered = filtered.filter(voucher => voucher.discountType === discountTypeFilter);
    }

    setFilteredVouchers(filtered);
    setCurrentPage(1);
  }, [vouchers, searchTerm, statusFilter, discountTypeFilter]);

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ ...toast, isVisible: false }), 3000);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDiscountTypeFilter("all");
    setCurrentPage(1);
  };

  // View detail
  const handleViewDetail = (voucher) => {
    setSelectedVoucher(voucher);
    setIsDetailModalOpen(true);
  };

  // Edit voucher
  const handleEdit = (voucher) => {
    setSelectedVoucher(voucher);
    setIsEditModalOpen(true);
  };

  // Delete voucher
  const handleDeleteClick = (voucher) => {
    setConfirmDelete({
      isOpen: true,
      voucherId: voucher.id,
      voucherTitle: voucher.title,
    });
  };

  const confirmDeleteVoucher = async () => {
    try {
      await request1.delete(`v1/admin/vouchers/${confirmDelete.voucherId}/`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      showToast("Xóa voucher thành công!", "success");
      fetchVouchers();
    } catch (e) {
      console.log("Lỗi khi xóa voucher:", e);
      showToast("Xóa voucher thất bại!", "error");
    } finally {
      setConfirmDelete({ isOpen: false, voucherId: null, voucherTitle: "" });
    }
  };

  // Toggle voucher status
  const handleToggleStatus = async (voucher) => {
    try {
      await request1.patch(`v1/admin/vouchers/${voucher.id}/toggle/`, {}, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const status = voucher.isActive ? "vô hiệu hóa" : "kích hoạt";
      showToast(`Đã ${status} voucher thành công!`, "success");
      fetchVouchers();
    } catch (e) {
      console.log("Lỗi khi thay đổi trạng thái voucher:", e);
      showToast("Thay đổi trạng thái thất bại!", "error");
    }
  };

  // Handle add voucher success
  const handleAddSuccess = () => {
    setIsAddVoucherModalOpen(false);
    showToast("Thêm voucher thành công!", "success");
    fetchVouchers();
  };

  // Handle edit voucher success
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    showToast("Cập nhật voucher thành công!", "success");
    fetchVouchers();
  };

  // Pagination
  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const currentVouchers = filteredVouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);
  const totalPages = Math.ceil(filteredVouchers.length / vouchersPerPage);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Không giới hạn";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Get status badge
  const getStatusBadge = (voucher) => {
    if (!voucher.isActive) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">Vô hiệu hóa</span>;
    }
    if (!voucher.isValid) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Hết hạn</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Hoạt động</span>;
  };

  // Get discount type display
  const getDiscountTypeDisplay = (voucher) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    }
    return `${formatCurrency(voucher.discountValue)}đ`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h1>
        <p className="text-gray-600">Quản lý các mã giảm giá và chương trình khuyến mãi</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Vô hiệu hóa</option>
              <option value="expired">Hết hạn</option>
            </select>

            <select
              value={discountTypeFilter}
              onChange={(e) => setDiscountTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Loại giảm giá</option>
              <option value="PERCENTAGE">Phần trăm</option>
              <option value="FIXED_AMOUNT">Số tiền cố định</option>
            </select>

            {(searchTerm || statusFilter !== "all" || discountTypeFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 underline"
              >
                Xóa bộ lọc
              </button>
            )}

            <button
              onClick={() => setIsAddVoucherModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FaPlus /> Thêm Voucher
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{vouchers.length}</div>
          <div className="text-gray-600 text-sm">Tổng voucher</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">
            {vouchers.filter(v => v.isActive && v.isValid).length}
          </div>
          <div className="text-gray-600 text-sm">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-red-600">
            {vouchers.filter(v => !v.isValid).length}
          </div>
          <div className="text-gray-600 text-sm">Hết hạn</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-600">
            {vouchers.filter(v => !v.isActive).length}
          </div>
          <div className="text-gray-600 text-sm">Vô hiệu hóa</div>
        </div>
      </div>

      {/* Voucher Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Không tìm thấy voucher nào</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mã
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Giảm giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Điểm đổi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Đã dùng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{voucher.title}</div>
                      {voucher.description && (
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          {voucher.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
                        {voucher.code || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-green-600">
                        {getDiscountTypeDisplay(voucher)}
                      </span>
                      {voucher.maxDiscountAmount && voucher.discountType === "PERCENTAGE" && (
                        <div className="text-xs text-gray-500">
                          Tối đa: {formatCurrency(voucher.maxDiscountAmount)}đ
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-orange-600 font-medium">
                        {voucher.pointsRequired || 0} điểm
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-700">
                        {voucher.usedCount || 0}
                        {voucher.usageLimit && ` / ${voucher.usageLimit}`}
                      </span>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(voucher)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(voucher)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(voucher)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(voucher)}
                          className={`p-2 rounded-full ${
                            voucher.isActive
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                          title={voucher.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {voucher.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(voucher)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Xóa"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Hiển thị {indexOfFirstVoucher + 1} - {Math.min(indexOfLastVoucher, filteredVouchers.length)} / {filteredVouchers.length} voucher
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === i + 1
                          ? "bg-primary text-white border-primary"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
      {isDetailModalOpen && selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedVoucher && (
        <VoucherEditModal
          voucher={selectedVoucher}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          accessToken={access_token}
        />
      )}

      {isAddVoucherModalOpen && (
        <AddVoucherModal
          onClose={() => setIsAddVoucherModalOpen(false)}
          onSuccess={handleAddSuccess}
          accessToken={access_token}
        />
      )}

      {/* Toast Notification */}
      <ToastNotification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa voucher "${confirmDelete.voucherTitle}"?`}
        onConfirm={confirmDeleteVoucher}
        onCancel={() => setConfirmDelete({ isOpen: false, voucherId: null, voucherTitle: "" })}
      />
    </div>
  );
};

export default VoucherList;
