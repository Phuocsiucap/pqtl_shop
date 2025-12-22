import React, { useState, useEffect } from "react";
import {
    FaClock,
    FaPlay,
    FaStop,
    FaMoneyBillWave,
    FaCalculator,
    FaHistory,
    FaShoppingCart,
    FaExclamationTriangle,
    FaCheck,
    FaTimes,
    FaEye
} from "react-icons/fa";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import {
    openShift,
    closeShift,
    getCurrentShift,
    getEmployeeShiftHistory,
    getPOSOrdersByShift
} from "../../../api/shift";

const EmployeeShiftHandover = () => {
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const employeeId = adminUser.id || "EMP001";
    const employeeName = adminUser.fullName || adminUser.username || "Nhân viên";
    const [shiftHistory, setShiftHistory] = useState([]);
    const [posOrders, setPosOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("current"); // current, history

    // Form states
    const [openingCash, setOpeningCash] = useState("");
    const [shiftName, setShiftName] = useState("Ca sáng");
    const [notes, setNotes] = useState("");

    // Cash counting states
    const [cashDenominations, setCashDenominations] = useState([
        { denomination: 500000, quantity: 0, total: 0 },
        { denomination: 200000, quantity: 0, total: 0 },
        { denomination: 100000, quantity: 0, total: 0 },
        { denomination: 50000, quantity: 0, total: 0 },
        { denomination: 20000, quantity: 0, total: 0 },
        { denomination: 10000, quantity: 0, total: 0 },
        { denomination: 5000, quantity: 0, total: 0 },
        { denomination: 2000, quantity: 0, total: 0 },
        { denomination: 1000, quantity: 0, total: 0 },
        { denomination: 500, quantity: 0, total: 0 },
    ]);

    const [selectedHistoryShift, setSelectedHistoryShift] = useState(null);

    const access_token = getCSRFTokenFromCookie("access_token_admin");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Lấy ca hiện tại
            try {
                const shift = await getCurrentShift(employeeId, access_token);
                setCurrentShift(shift);
                
                // Lấy đơn hàng của ca hiện tại
                if (shift) {
                    const orders = await getPOSOrdersByShift(shift.id, access_token);
                    setPosOrders(orders);
                }
            } catch (e) {
                setCurrentShift(null);
            }

            // Lấy lịch sử bàn giao ca
            const history = await getEmployeeShiftHistory(employeeId, access_token);
            setShiftHistory(history);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShift = async () => {
        if (!openingCash || parseFloat(openingCash) < 0) {
            alert("Vui lòng nhập số tiền đầu ca hợp lệ!");
            return;
        }

        try {
            const shift = await openShift({
                employeeId,
                employeeName,
                shiftName,
                openingCash: parseFloat(openingCash),
                notes
            }, access_token);

            setCurrentShift(shift);
            setPosOrders([]);
            alert("Mở ca thành công!");
            setOpeningCash("");
            setNotes("");
        } catch (error) {
            console.error("Error opening shift:", error);
            alert(error.response?.data?.error || "Có lỗi xảy ra khi mở ca!");
        }
    };

    const handleDenominationChange = (index, value) => {
        const newDenominations = [...cashDenominations];
        newDenominations[index].quantity = parseInt(value) || 0;
        newDenominations[index].total = newDenominations[index].denomination * newDenominations[index].quantity;
        setCashDenominations(newDenominations);
    };

    const calculateTotalCash = () => {
        return cashDenominations.reduce((sum, d) => sum + d.total, 0);
    };

    const handleCloseShift = async () => {
        const totalCash = calculateTotalCash();
        
        if (totalCash <= 0) {
            alert("Vui lòng đếm tiền trong két trước khi đóng ca!");
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn đóng ca với tổng tiền mặt: ${formatCurrency(totalCash)}?`)) {
            return;
        }

        try {
            const shift = await closeShift(currentShift.id, {
                actualCashInDrawer: totalCash,
                cashDenominations: cashDenominations.filter(d => d.quantity > 0),
                notes
            }, access_token);

            alert("Đóng ca và gửi bàn giao thành công! Vui lòng chờ Admin xác nhận.");
            setCurrentShift(null);
            setCashDenominations(cashDenominations.map(d => ({ ...d, quantity: 0, total: 0 })));
            setNotes("");
            fetchData();
        } catch (error) {
            console.error("Error closing shift:", error);
            alert(error.response?.data?.error || "Có lỗi xảy ra khi đóng ca!");
        }
    };

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

    const getStatusBadge = (status) => {
        const config = {
            OPEN: { label: "Đang mở", color: "bg-blue-100 text-blue-800" },
            PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
            APPROVED: { label: "Đã duyệt", color: "bg-green-100 text-green-800" },
            REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800" },
        };
        return config[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    };

    // Tính toán doanh thu và chênh lệch
    const calculateExpectedCash = () => {
        if (!currentShift) return 0;
        const cashRevenue = posOrders
            .filter(o => o.status === "COMPLETED" && o.paymentMethod === "CASH")
            .reduce((sum, o) => sum + o.totalAmount, 0);
        return currentShift.openingCash + cashRevenue;
    };

    const cashDifference = calculateTotalCash() - calculateExpectedCash();

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <FaClock className="mr-3 text-blue-500" />
                Bàn giao Ca
            </h1>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-6 py-3 font-medium ${activeTab === "current"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    onClick={() => setActiveTab("current")}
                >
                    <FaClock className="inline mr-2" />
                    Ca hiện tại
                </button>
                <button
                    className={`px-6 py-3 font-medium ${activeTab === "history"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    onClick={() => setActiveTab("history")}
                >
                    <FaHistory className="inline mr-2" />
                    Lịch sử bàn giao
                </button>
            </div>

            {activeTab === "current" ? (
                <div>
                    {!currentShift ? (
                        // Form mở ca mới
                        <div className="bg-white rounded-lg shadow p-6 max-w-lg">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <FaPlay className="mr-2 text-green-500" />
                                Mở Ca Mới
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên ca làm việc
                                    </label>
                                    <select
                                        value={shiftName}
                                        onChange={(e) => setShiftName(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Ca sáng">Ca sáng (6:00 - 14:00)</option>
                                        <option value="Ca chiều">Ca chiều (14:00 - 22:00)</option>
                                        <option value="Ca tối">Ca tối (22:00 - 6:00)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tiền mặt đầu ca (tiền lẻ để thối)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={openingCash}
                                            onChange={(e) => setOpeningCash(e.target.value)}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập số tiền..."
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500">VNĐ</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Ghi chú thêm (nếu có)..."
                                    />
                                </div>

                                <button
                                    onClick={handleOpenShift}
                                    className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium flex items-center justify-center"
                                >
                                    <FaPlay className="mr-2" />
                                    Mở Ca
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Hiển thị ca đang mở và form đóng ca
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Thông tin ca hiện tại */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <FaClock className="mr-2 text-blue-500" />
                                    Thông tin ca hiện tại
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ca:</span>
                                        <span className="font-medium">{currentShift.shiftName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Bắt đầu:</span>
                                        <span className="font-medium">{formatDateTime(currentShift.shiftStartTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tiền đầu ca:</span>
                                        <span className="font-medium text-blue-600">{formatCurrency(currentShift.openingCash)}</span>
                                    </div>
                                </div>

                                {/* Thống kê nhanh */}
                                <div className="mt-6 pt-4 border-t">
                                    <h3 className="font-medium mb-3 flex items-center">
                                        <FaShoppingCart className="mr-2 text-purple-500" />
                                        Thống kê bán hàng
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-purple-50 rounded-lg p-3">
                                            <p className="text-sm text-gray-500">Số đơn</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                {posOrders.filter(o => o.status === "COMPLETED").length}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-3">
                                            <p className="text-sm text-gray-500">Doanh thu</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {formatCurrency(posOrders.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + o.totalAmount, 0))}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chi tiết theo phương thức thanh toán */}
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2 text-sm text-gray-600">Theo phương thức thanh toán:</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">💵 Tiền mặt:</span>
                                            <span className="font-medium">
                                                {formatCurrency(posOrders.filter(o => o.status === "COMPLETED" && o.paymentMethod === "CASH").reduce((sum, o) => sum + o.totalAmount, 0))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">🏦 Chuyển khoản:</span>
                                            <span className="font-medium">
                                                {formatCurrency(posOrders.filter(o => o.status === "COMPLETED" && o.paymentMethod === "BANK_TRANSFER").reduce((sum, o) => sum + o.totalAmount, 0))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">📱 Ví điện tử:</span>
                                            <span className="font-medium">
                                                {formatCurrency(posOrders.filter(o => o.status === "COMPLETED" && o.paymentMethod === "EWALLET").reduce((sum, o) => sum + o.totalAmount, 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form đếm tiền và đóng ca */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <FaCalculator className="mr-2 text-orange-500" />
                                    Đếm tiền & Đóng ca
                                </h2>

                                {/* Bảng đếm tiền */}
                                <div className="mb-6">
                                    <h3 className="font-medium mb-3">Đếm tiền trong két:</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Mệnh giá</th>
                                                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-600">SL</th>
                                                    <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cashDenominations.map((denom, index) => (
                                                    <tr key={denom.denomination} className="border-b">
                                                        <td className="px-3 py-2 text-sm">{formatCurrency(denom.denomination)}</td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={denom.quantity || ""}
                                                                onChange={(e) => handleDenominationChange(index, e.target.value)}
                                                                className="w-16 p-1 border rounded text-center"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-sm text-right font-medium">
                                                            {formatCurrency(denom.total)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-100">
                                                    <td colSpan="2" className="px-3 py-2 font-bold">Tổng tiền thực tế:</td>
                                                    <td className="px-3 py-2 text-right font-bold text-green-600">
                                                        {formatCurrency(calculateTotalCash())}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Đối chiếu */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h3 className="font-medium mb-3 flex items-center">
                                        <FaMoneyBillWave className="mr-2 text-green-500" />
                                        Đối chiếu tiền mặt
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tiền đầu ca:</span>
                                            <span className="font-medium">{formatCurrency(currentShift.openingCash)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Doanh thu tiền mặt:</span>
                                            <span className="font-medium">
                                                {formatCurrency(posOrders.filter(o => o.status === "COMPLETED" && o.paymentMethod === "CASH").reduce((sum, o) => sum + o.totalAmount, 0))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="text-gray-700 font-medium">Tiền dự kiến:</span>
                                            <span className="font-bold text-blue-600">{formatCurrency(calculateExpectedCash())}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700 font-medium">Tiền thực tế:</span>
                                            <span className="font-bold text-green-600">{formatCurrency(calculateTotalCash())}</span>
                                        </div>
                                        <div className={`flex justify-between pt-2 border-t ${cashDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            <span className="font-bold flex items-center">
                                                <FaExclamationTriangle className="mr-1" />
                                                Chênh lệch:
                                            </span>
                                            <span className="font-bold">
                                                {cashDifference >= 0 ? '+' : ''}{formatCurrency(cashDifference)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ghi chú khi đóng ca
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="2"
                                        placeholder="Ghi chú thêm (nếu có)..."
                                    />
                                </div>

                                {/* Nút đóng ca */}
                                <button
                                    onClick={handleCloseShift}
                                    className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center"
                                >
                                    <FaStop className="mr-2" />
                                    Đóng Ca & Gửi Bàn Giao
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Tab lịch sử bàn giao ca
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ca</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chênh lệch</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {shiftHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            Chưa có lịch sử bàn giao ca
                                        </td>
                                    </tr>
                                ) : (
                                    shiftHistory.map((shift) => {
                                        const statusBadge = getStatusBadge(shift.status);
                                        return (
                                            <tr key={shift.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{shift.shiftName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{formatDateTime(shift.shiftStartTime)}</div>
                                                    {shift.shiftEndTime && (
                                                        <div className="text-sm text-gray-500">→ {formatDateTime(shift.shiftEndTime)}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-green-600">
                                                        {formatCurrency(shift.totalRevenue)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm font-medium ${shift.cashDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatCurrency(shift.cashDifference)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => setSelectedHistoryShift(shift)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal xem chi tiết lịch sử */}
            {selectedHistoryShift && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">Chi tiết bàn giao ca</h2>
                            <button onClick={() => setSelectedHistoryShift(null)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500">Ca:</p>
                                        <p className="font-medium">{selectedHistoryShift.shiftName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Trạng thái:</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedHistoryShift.status).color}`}>
                                            {getStatusBadge(selectedHistoryShift.status).label}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500">Tiền đầu ca:</p>
                                        <p className="font-medium">{formatCurrency(selectedHistoryShift.openingCash)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Doanh thu:</p>
                                        <p className="font-medium text-green-600">{formatCurrency(selectedHistoryShift.totalRevenue)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500">Tiền dự kiến:</p>
                                        <p className="font-medium">{formatCurrency(selectedHistoryShift.expectedCash)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Tiền thực tế:</p>
                                        <p className="font-medium">{formatCurrency(selectedHistoryShift.actualCashInDrawer)}</p>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg ${selectedHistoryShift.cashDifference >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <p className="text-gray-500">Chênh lệch:</p>
                                    <p className={`font-bold text-lg ${selectedHistoryShift.cashDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedHistoryShift.cashDifference >= 0 ? '+' : ''}{formatCurrency(selectedHistoryShift.cashDifference)}
                                    </p>
                                </div>
                                {selectedHistoryShift.notes && (
                                    <div>
                                        <p className="text-gray-500">Ghi chú:</p>
                                        <p className="font-medium">{selectedHistoryShift.notes}</p>
                                    </div>
                                )}
                                {selectedHistoryShift.adminNotes && (
                                    <div>
                                        <p className="text-gray-500">Ghi chú Admin:</p>
                                        <p className="font-medium text-red-600">{selectedHistoryShift.adminNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end p-6 border-t">
                            <button
                                onClick={() => setSelectedHistoryShift(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeShiftHandover;
