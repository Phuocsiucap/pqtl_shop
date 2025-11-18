import React, { useEffect, useState } from "react";
import OrderTable from "./OrderTable";
import DetailModal from "./DetailModal";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { useNavigate } from "react-router-dom";
// Dữ liệu giả lập đơn hàng
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const access_token = getCSRFTokenFromCookie("access_token_admin");
  const navigate=useNavigate();
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
    setShowConfirmPopup(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };

  const handleCloseConfirmPopup = () => {
    setShowConfirmPopup(false);
    setSelectedOrderId(null);
    setSelectedOrder(null);
  };

  const handleConfirm = async() => {
    console.log("handleConfirm called with selectedOrderId:", selectedOrderId);
    console.log("selectedOrder:", selectedOrder);
    
    if (!selectedOrderId) {
      alert("Lỗi: ID đơn hàng không hợp lệ");
      return;
    }
    
    let newStatus;
    const currentStatus = selectedOrder.shipping_status || "Chờ xác nhận";
    
    switch (currentStatus) {
      case "Chờ xác nhận":
        newStatus = "Đã xác nhận";
        break;
      case "Đã xác nhận":
        newStatus = "Đang giao";
        break;
      case "Đang giao":
        newStatus = "Đã giao";
        break;
      default:
        newStatus = currentStatus;
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
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("v1/admin/orders/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log("All orders:", response.data);
        setOrders(response.data);
      } catch (e) {
        console.log("Lỗi ", e);
      }
    };
    fetch();
  }, []);
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Quản Lý Đơn Hàng</h2>

      {/* Bảng đơn hàng */}
      <OrderTable
        orders={orders}
        onViewDetails={handleViewDetails}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Modal Xem chi tiết */}
      {showDetailModal && selectedOrder && (
        <DetailModal onClose={handleCloseDetailModal}/>
      )}

      {/* Popup Xác nhận */}
      {showConfirmPopup && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">
              Cập nhật đơn hàng 
              <span className="text-primary font-semibold">
              &nbsp;#{selectedOrder.id}
              </span>
            </h3>
            <p>Bạn có chắc chắn cập nhật trạng thái đơn hàng này không?</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleCloseConfirmPopup}
                className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
