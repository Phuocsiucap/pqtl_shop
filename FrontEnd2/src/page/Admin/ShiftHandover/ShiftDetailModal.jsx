import React from "react";
import { 
    FaTimes, 
    FaCheck, 
    FaUser, 
    FaClock, 
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaShoppingCart,
    FaCreditCard,
    FaWallet
} from "react-icons/fa";

const ShiftDetailModal = ({ shift, onClose, onApprove, onReject }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount || 0);
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return "-";
        return new Date(dateTime).toLocaleString("vi-VN");
    };

    const statusConfig = {
        OPEN: { label: "Đang mở", color: "bg-blue-100 text-blue-800" },
        PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
        APPROVED: { label: "Đã duyệt", color: "bg-green-100 text-green-800" },
        REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800" },
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Chi tiết Bàn giao Ca</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Employee & Shift Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                                <FaUser className="mr-2" /> Thông tin nhân viên
                            </h3>
                            <div className="space-y-2">
                                <p><span className="text-gray-500">Tên:</span> <span className="font-medium">{shift.employeeName}</span></p>
                                <p><span className="text-gray-500">ID:</span> <span className="font-medium">{shift.employeeId}</span></p>
                                <p><span className="text-gray-500">Ca:</span> <span className="font-medium">{shift.shiftName}</span></p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                                <FaClock className="mr-2" /> Thời gian ca
                            </h3>
                            <div className="space-y-2">
                                <p><span className="text-gray-500">Bắt đầu:</span> <span className="font-medium">{formatDateTime(shift.shiftStartTime)}</span></p>
                                <p><span className="text-gray-500">Kết thúc:</span> <span className="font-medium">{formatDateTime(shift.shiftEndTime)}</span></p>
                                <p>
                                    <span className="text-gray-500">Trạng thái:</span>{" "}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[shift.status]?.color}`}>
                                        {statusConfig[shift.status]?.label}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Summary */}
                    <div className="bg-green-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <FaMoneyBillWave className="mr-2 text-green-600" /> Tổng kết doanh thu
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-gray-500 text-sm">Tổng doanh thu</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(shift.totalRevenue)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Tiền mặt</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(shift.cashRevenue)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Chuyển khoản</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(shift.bankTransferRevenue)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Ví điện tử</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(shift.eWalletRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cash Flow */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <FaWallet className="mr-2 text-blue-600" /> Đối chiếu tiền mặt
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-gray-500 text-sm">Tiền đầu ca</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(shift.openingCash)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Doanh thu tiền mặt</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(shift.cashRevenue)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Tiền dự kiến</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(shift.expectedCash)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Tiền thực tế</p>
                                <p className="text-lg font-semibold text-gray-800">{formatCurrency(shift.actualCashInDrawer)}</p>
                            </div>
                        </div>
                        
                        {/* Cash Difference */}
                        <div className={`mt-4 p-3 rounded-lg ${shift.cashDifference >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                            <div className="flex items-center justify-between">
                                <span className="font-medium flex items-center">
                                    <FaExclamationTriangle className={`mr-2 ${shift.cashDifference >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                    Chênh lệch tiền:
                                </span>
                                <span className={`text-xl font-bold ${shift.cashDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {shift.cashDifference >= 0 ? '+' : ''}{formatCurrency(shift.cashDifference)}
                                </span>
                            </div>
                            {shift.cashDifference !== 0 && (
                                <p className={`text-sm mt-1 ${shift.cashDifference >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {shift.cashDifference > 0 ? 'Thừa tiền trong két' : 'Thiếu tiền trong két'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Cash Denominations */}
                    {shift.cashDenominations && shift.cashDenominations.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3">Chi tiết mệnh giá tiền đếm được</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Mệnh giá</th>
                                            <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Số lượng</th>
                                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shift.cashDenominations.map((denom, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="px-4 py-2 text-sm">{formatCurrency(denom.denomination)}</td>
                                                <td className="px-4 py-2 text-sm text-center">{denom.quantity}</td>
                                                <td className="px-4 py-2 text-sm text-right">{formatCurrency(denom.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Order Statistics */}
                    <div className="bg-purple-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <FaShoppingCart className="mr-2 text-purple-600" /> Thống kê đơn hàng
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <p className="text-gray-500 text-sm">Tổng đơn</p>
                                <p className="text-lg font-bold text-purple-600">{shift.totalOrders || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Tiền mặt</p>
                                <p className="text-lg font-semibold text-gray-800">{shift.cashOrders || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Chuyển khoản</p>
                                <p className="text-lg font-semibold text-gray-800">{shift.bankTransferOrders || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Ví điện tử</p>
                                <p className="text-lg font-semibold text-gray-800">{shift.eWalletOrders || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Đã hủy</p>
                                <p className="text-lg font-semibold text-red-600">{shift.cancelledOrders || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {(shift.notes || shift.adminNotes) && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3">Ghi chú</h3>
                            {shift.notes && (
                                <div className="mb-2">
                                    <p className="text-gray-500 text-sm">Nhân viên:</p>
                                    <p className="text-gray-800">{shift.notes}</p>
                                </div>
                            )}
                            {shift.adminNotes && (
                                <div>
                                    <p className="text-gray-500 text-sm">Admin:</p>
                                    <p className="text-gray-800">{shift.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Approval Info */}
                    {shift.approvedBy && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3">Thông tin xác nhận</h3>
                            <p><span className="text-gray-500">Người xác nhận:</span> <span className="font-medium">{shift.approvedByName}</span></p>
                            <p><span className="text-gray-500">Thời gian:</span> <span className="font-medium">{formatDateTime(shift.approvedAt)}</span></p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                    {shift.status === "PENDING" && (
                        <>
                            <button
                                onClick={() => onReject(shift.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                            >
                                <FaTimes className="mr-2" /> Từ chối
                            </button>
                            <button
                                onClick={() => onApprove(shift.id)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center"
                            >
                                <FaCheck className="mr-2" /> Phê duyệt
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShiftDetailModal;
