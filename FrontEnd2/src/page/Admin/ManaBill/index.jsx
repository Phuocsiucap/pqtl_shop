import React, { useEffect, useState } from "react";
import OrderTable from "./OrderTable";
import DetailModal from "./DetailModal";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaSync } from "react-icons/fa";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [newStatus, setNewStatus] = useState(""); // Trạng thái mới được chọn
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  const navigate = useNavigate();
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("orderId"); // orderId, userName, phone, date
  const [orderStats, setOrderStats] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0
  });

  // Status mapping
  const statusList = [
    { key: "all", label: "Tất cả", color: "bg-gray-500" },
    { key: "pending", label: "Chờ xác nhận", value: "Chờ xác nhận", color: "bg-yellow-500" },
    { key: "confirmed", label: "Đã xác nhận", value: "Đã xác nhận", color: "bg-green-500" },
    { key: "shipping", label: "Đang giao", value: "Đang giao", color: "bg-blue-500" },
    { key: "delivered", label: "Đã giao", value: "Đã giao", color: "bg-purple-500" },
    { key: "cancelled", label: "Hủy", value: "Hủy", color: "bg-red-500" },
  ];

  // Calculate stats from orders
  const calculateStats = (orderList) => {
    const stats = {
      all: orderList.length,
      pending: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0
    };
    
    orderList.forEach(order => {
      const status = order.shipping_status || "Chờ xác nhận";
      switch (status) {
        case "Chờ xác nhận": stats.pending++; break;
        case "Đã xác nhận": stats.confirmed++; break;
        case "Đang giao": stats.shipping++; break;
        case "Đã giao": stats.delivered++; break;
        case "Hủy": stats.cancelled++; break;
        default: break;
      }
    });
    
    return stats;
  };

  // Helper to get order date from different fields (orderDate, order_date, createdAt, created_at)
  const getOrderDate = (order) => {
    return order?.orderDate || order?.order_date || order?.createdAt || order?.created_at || null;
  };

  // Filter orders based on status and search
  const filterOrders = () => {
    let result = [...orders];
    
    // Filter by status
if (selectedStatus !== "all") {
      const statusItem = statusList.find(s => s.key === selectedStatus);
      if (statusItem && statusItem.value) {
        result = result.filter(order => 
          (order.shipping_status || "Chờ xác nhận") === statusItem.value
        );
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => {
        switch (searchType) {
          case "orderId":
            return order.id?.toLowerCase().includes(query);
          case "userName":
            return order.userName?.toLowerCase().includes(query) || 
                   order.fullName?.toLowerCase().includes(query);
          case "phone":
            return order.phone?.includes(query);
          case "date":
            try {
              const orderDate = new Date(getOrderDate(order));
              if (isNaN(orderDate.getTime())) return false;
              return orderDate.toLocaleDateString('vi-VN').includes(query);
            } catch (e) {
              return false;
            }
          default:
            return true;
        }
      });
    }
    
    setFilteredOrders(result);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, searchQuery, searchType]);

  // Update stats when orders change
  useEffect(() => {
    setOrderStats(calculateStats(orders));
  }, [orders]);
  const handleViewDetails = async(order) => {
    console.log("Order clicked:", order);
    try {
      const response = await request1.get(`v1/admin/orders/${order.id}/goods/`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log("Order details:",response);
      // setOrders(response.data);
      navigate("/admin/managebill/billdetail",{state:{order: response.data}})
    } catch (e) {
      console.log("Lỗi ", e);
    }
  };

  const handleConfirmOrder = (order) => {
    console.log("Confirm order clicked:", order);
    setSelectedOrder(order);
    setSelectedOrderId(order.id);
    setNewStatus(order.shipping_status || "Chờ xác nhận"); // Set trạng thái hiện tại
    setShowConfirmPopup(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };

  const handleCloseConfirmPopup = () => {
    setShowConfirmPopup(false);
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setNewStatus("");
  };

  // Hàm xử lý hủy đơn hàng nhanh
  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setSelectedOrderId(order.id);
    setNewStatus("Hủy");
    setShowConfirmPopup(true);
  };

  // Lấy danh sách trạng thái có thể chuyển đến
  const getAvailableStatuses = (currentStatus) => {
    const allStatuses = [
      { value: "Chờ xác nhận", label: "Chờ xác nhận" },
      { value: "Đã xác nhận", label: "Đã xác nhận" },
      { value: "Đang giao", label: "Đang giao" },
{ value: "Đã giao", label: "Đã giao" },
      { value: "Hủy", label: "Hủy" },
    ];
    return allStatuses;
  };

  const handleConfirm = async() => {
    console.log("handleConfirm called with selectedOrderId:", selectedOrderId);
    console.log("selectedOrder:", selectedOrder);
    console.log("newStatus:", newStatus);

    if (!selectedOrderId) {
      alert("Lỗi: ID đơn hàng không hợp lệ");
      return;
    }

    const currentStatus = selectedOrder.shipping_status || "Chờ xác nhận";

    // Kiểm tra nếu trạng thái không thay đổi
    if (newStatus === currentStatus) {
      alert("Vui lòng chọn trạng thái khác với trạng thái hiện tại");
      return;
    }

    try{
      const response=await request1.patch(`v1/admin/orders/${selectedOrderId}/`,
        {
          shipping_status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      console.log("Order updated:", response)
      // Cập nhật lại trạng thái của đơn hàng
      const updatedOrders = orders.map((o) =>
        o.id === selectedOrderId
          ? { ...o, shipping_status: newStatus }
          : o
      );
      setOrders(updatedOrders);
      setShowConfirmPopup(false);
      setSelectedOrderId(null);
      setSelectedOrder(null);
    }
    catch(e){
      alert("Có lỗi khi cập nhật đơn hàng")
      console.log("Lỗi ",e)
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await request1.get("v1/admin/orders/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      // Sort orders by date descending (newest first) using available date fields
      const data = response.data;
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const da = getOrderDate(a);
            const db = getOrderDate(b);
            return new Date(db) - new Date(da);
          })
        : data;
      console.log("All orders (sorted):", sorted);
      setOrders(sorted);
    } catch (e) {
      console.log("Lỗi ", e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    fetchOrders();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Quản Lý Đơn Hàng</h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          <FaSync />
          Làm mới
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
{statusList.map((status) => (
          <button
            key={status.key}
            onClick={() => setSelectedStatus(status.key)}
            className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
              selectedStatus === status.key
                ? `${status.color} text-white shadow-lg`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              selectedStatus === status.key ? "bg-white/20" : "bg-gray-200"
            }`}>
              {status.key === "all" ? orderStats.all :
               status.key === "pending" ? orderStats.pending :
               status.key === "confirmed" ? orderStats.confirmed :
               status.key === "shipping" ? orderStats.shipping :
               status.key === "delivered" ? orderStats.delivered :
               orderStats.cancelled}
            </span>
          </button>
        ))}
      </div>

      {/* Search Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="font-medium text-gray-700">Tìm kiếm:</span>
          </div>
          
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="orderId">Mã đơn hàng</option>
            <option value="userName">Tên người dùng</option>
            <option value="phone">Số điện thoại</option>
            <option value="date">Ngày đặt (dd/mm/yyyy)</option>
          </select>
          
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === "orderId" ? "Nhập mã đơn hàng..." :
                searchType === "userName" ? "Nhập tên người dùng..." :
                searchType === "phone" ? "Nhập số điện thoại..." :
                "Nhập ngày (dd/mm/yyyy)..."
              }
              className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Xóa bộ lọc
</button>
          )}
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-blue-600">{filteredOrders.length}</span> / {orders.length} đơn hàng
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <OrderTable
        orders={filteredOrders}
        onViewDetails={handleViewDetails}
        onConfirmOrder={handleConfirmOrder}
        onCancelOrder={handleCancelOrder}
      />

      {/* Modal Xem chi tiết */}
      {showDetailModal && selectedOrder && (
        <DetailModal onClose={handleCloseDetailModal}/>
      )}

      {/* Popup Xác nhận */}
      {showConfirmPopup && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[450px]">
            <h3 className="text-lg font-semibold mb-4">
              Cập nhật đơn hàng
              <span className="text-primary font-semibold">
              &nbsp;#{selectedOrder.id}
              </span>
            </h3>

            {/* Trạng thái hiện tại */}
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Trạng thái hiện tại:</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                (selectedOrder.shipping_status || "Chờ xác nhận") === "Chờ xác nhận" ? "bg-yellow-100 text-yellow-700" :
                selectedOrder.shipping_status === "Đã xác nhận" ? "bg-green-100 text-green-700" :
                selectedOrder.shipping_status === "Đang giao" ? "bg-blue-100 text-blue-700" :
                selectedOrder.shipping_status === "Đã giao" ? "bg-purple-100 text-purple-700" :
                selectedOrder.shipping_status === "Hủy" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
              }`}>
                {selectedOrder.shipping_status || "Chờ xác nhận"}
              </span>
            </div>

            {/* Dropdown chọn trạng thái mới */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Chọn trạng thái mới:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getAvailableStatuses(selectedOrder.shipping_status || "Chờ xác nhận").map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cảnh báo khi hủy đơn */}
            {newStatus === "Hủy" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
<p className="text-red-600 text-sm font-medium">
                  ⚠️ Cảnh báo: Hủy đơn hàng sẽ không thể hoàn tác!
                </p>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={handleCloseConfirmPopup}
                className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirm}
                className={`px-6 py-2 rounded-md text-white ${
                  newStatus === "Hủy"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {newStatus === "Hủy" ? "Xác nhận hủy" : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;