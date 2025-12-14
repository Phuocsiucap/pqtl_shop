import { request1 } from "../../utils/request";

// ==================== SHIFT HANDOVER API ====================

/**
 * Mở ca mới
 */
export const openShift = async (shiftData, token) => {
    const response = await request1.post("v1/shift/open", shiftData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

/**
 * Đóng ca và bàn giao
 */
export const closeShift = async (shiftId, closeData, token) => {
    const response = await request1.post(`v1/shift/${shiftId}/close`, closeData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

/**
 * Lấy ca đang mở của nhân viên
 */
export const getCurrentShift = async (employeeId, token) => {
    const response = await request1.get(`v1/shift/current/${employeeId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Lấy lịch sử bàn giao ca của nhân viên
 */
export const getEmployeeShiftHistory = async (employeeId, token) => {
    const response = await request1.get(`v1/shift/history/${employeeId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Lấy chi tiết ca làm việc
 */
export const getShiftById = async (shiftId, token) => {
    const response = await request1.get(`v1/shift/${shiftId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// ==================== ADMIN SHIFT API ====================

/**
 * Lấy tất cả ca làm việc (Admin)
 */
export const getAllShifts = async (token) => {
    const response = await request1.get("v1/shift/admin/all", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Lấy ca theo trạng thái (Admin)
 */
export const getShiftsByStatus = async (status, token) => {
    const response = await request1.get(`v1/shift/admin/status/${status}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Đếm số ca đang chờ xác nhận (Admin)
 */
export const countPendingShifts = async (token) => {
    const response = await request1.get("v1/shift/admin/pending-count", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Phê duyệt bàn giao ca (Admin)
 */
export const approveShift = async (shiftId, adminData, token) => {
    const response = await request1.post(`v1/shift/admin/${shiftId}/approve`, adminData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

/**
 * Từ chối bàn giao ca (Admin)
 */
export const rejectShift = async (shiftId, adminData, token) => {
    const response = await request1.post(`v1/shift/admin/${shiftId}/reject`, adminData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

/**
 * Thống kê bàn giao ca (Admin)
 */
export const getShiftStatistics = async (startDate, endDate, token) => {
    let url = "v1/shift/admin/statistics";
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join("&")}`;
    
    const response = await request1.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// ==================== POS ORDER API ====================

/**
 * Tạo đơn hàng POS
 */
export const createPOSOrder = async (orderData, token) => {
    const response = await request1.post("v1/shift/pos/order", orderData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

/**
 * Hủy đơn hàng POS
 */
export const cancelPOSOrder = async (orderId, reason, token) => {
    const response = await request1.post(`v1/shift/pos/order/${orderId}/cancel`, { reason }, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

/**
 * Lấy đơn hàng POS của ca
 */
export const getPOSOrdersByShift = async (shiftId, token) => {
    const response = await request1.get(`v1/shift/pos/orders/${shiftId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Lấy tất cả đơn hàng POS
 */
export const getAllPOSOrders = async (token) => {
    const response = await request1.get("v1/shift/pos/orders", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Lấy chi tiết đơn POS
 */
export const getPOSOrderById = async (orderId, token) => {
    const response = await request1.get(`v1/shift/pos/order/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Tìm kiếm sản phẩm cho POS
 */
export const searchProductsForPOS = async (keyword, token) => {
    const response = await request1.get(`v1/shift/pos/products/search${keyword ? `?keyword=${keyword}` : ""}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export default {
    // Shift Handover
    openShift,
    closeShift,
    getCurrentShift,
    getEmployeeShiftHistory,
    getShiftById,
    // Admin
    getAllShifts,
    getShiftsByStatus,
    countPendingShifts,
    approveShift,
    rejectShift,
    getShiftStatistics,
    // POS
    createPOSOrder,
    cancelPOSOrder,
    getPOSOrdersByShift,
    getAllPOSOrders,
    getPOSOrderById,
    searchProductsForPOS,
};
