import React, { useState, useEffect } from "react";
import { 
    FaClipboardList, 
    FaCheck, 
    FaTimes, 
    FaEye, 
    FaClock, 
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaChartLine
} from "react-icons/fa";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { getAllShifts, approveShift, rejectShift, getShiftStatistics } from "../../../api/shift";
import ShiftDetailModal from "./ShiftDetailModal";

const ShiftHandoverManager = () => {
    const [shifts, setShifts] = useState([]);
    const [filteredShifts, setFilteredShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedShift, setSelectedShift] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statistics, setStatistics] = useState(null);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const access_token = getCSRFTokenFromCookie("access_token_admin");

    const statusConfig = {
        OPEN: { label: "Đang mở", color: "bg-blue-100 text-blue-800", icon: <FaClock /> },
        PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: <FaClipboardList /> },
        APPROVED: { label: "Đã duyệt", color: "bg-green-100 text-green-800", icon: <FaCheck /> },
        REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-800", icon: <FaTimes /> },
    };

    useEffect(() => {
        fetchShifts();
        fetchStatistics();
    }, []);

    useEffect(() => {
        filterShifts();
    }, [shifts, statusFilter, searchQuery, dateRange]);

    const fetchShifts = async () => {
        try {
            setLoading(true);
            const data = await getAllShifts(access_token);
            setShifts(data);
        } catch (error) {
            console.error("Error fetching shifts:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const data = await getShiftStatistics(null, null, access_token);
            setStatistics(data);
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    const filterShifts = () => {
        let result = [...shifts];
        
        // Filter by status
        if (statusFilter !== "all") {
            result = result.filter(shift => shift.status === statusFilter);
        }
        
        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(shift => 
                shift.employeeName?.toLowerCase().includes(query) ||
                shift.shiftName?.toLowerCase().includes(query)
            );
        }
        
        // Filter by date range
        if (dateRange.start) {
            result = result.filter(shift => 
                new Date(shift.shiftStartTime) >= new Date(dateRange.start)
            );
        }
        if (dateRange.end) {
            result = result.filter(shift => 
                new Date(shift.shiftStartTime) <= new Date(dateRange.end + "T23:59:59")
            );
        }
        
        setFilteredShifts(result);
        setCurrentPage(1);
    };

    const handleApprove = async (shiftId) => {
        if (!window.confirm("Bạn có chắc chắn muốn phê duyệt bàn giao ca này?")) return;
        
        try {
            await approveShift(shiftId, {
                adminId: "admin",
                adminName: "Admin",
                adminNotes: ""
            }, access_token);
            
            alert("Phê duyệt thành công!");
            fetchShifts();
            fetchStatistics();
        } catch (error) {
            console.error("Error approving shift:", error);
            alert("Có lỗi xảy ra khi phê duyệt!");
        }
    };

    const handleReject = async (shiftId) => {
        const reason = window.prompt("Nhập lý do từ chối:");
        if (!reason) return;
        
        try {
            await rejectShift(shiftId, {
                adminId: "admin",
                adminName: "Admin",
                adminNotes: reason
            }, access_token);
            
            alert("Đã từ chối bàn giao ca!");
            fetchShifts();
            fetchStatistics();
        } catch (error) {
            console.error("Error rejecting shift:", error);
            alert("Có lỗi xảy ra!");
        }
    };

    const viewShiftDetail = (shift) => {
        setSelectedShift(shift);
        setIsModalOpen(true);
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

    // Pagination
    const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);
    const paginatedShifts = filteredShifts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Bàn giao Ca</h1>
            
            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Tổng số ca</p>
                                <p className="text-2xl font-bold text-gray-800">{statistics.totalShifts}</p>
                            </div>
                            <FaClipboardList className="text-3xl text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Chờ xác nhận</p>
                                <p className="text-2xl font-bold text-yellow-600">{statistics.pendingShifts}</p>
                            </div>
                            <FaClock className="text-3xl text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Tổng doanh thu</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(statistics.totalRevenue)}</p>
                            </div>
                            <FaMoneyBillWave className="text-3xl text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Chênh lệch tiền</p>
                                <p className={`text-xl font-bold ${statistics.totalCashDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(statistics.totalCashDifference)}
                                </p>
                            </div>
                            <FaExclamationTriangle className={`text-3xl ${statistics.totalCashDifference >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên nhân viên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-3 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="OPEN">Đang mở</option>
                            <option value="PENDING">Chờ xác nhận</option>
                            <option value="APPROVED">Đã duyệt</option>
                            <option value="REJECTED">Từ chối</option>
                        </select>
                    </div>
                    
                    {/* Date Range */}
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Đang tải...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nhân viên
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ca làm việc
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doanh thu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Chênh lệch
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedShifts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedShifts.map((shift) => (
                                        <tr key={shift.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{shift.employeeName}</div>
                                                <div className="text-sm text-gray-500">ID: {shift.employeeId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{shift.shiftName}</div>
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
                                                <div className="text-xs text-gray-500">
                                                    {shift.totalOrders || 0} đơn hàng
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${shift.cashDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(shift.cashDifference)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[shift.status]?.color}`}>
                                                    {statusConfig[shift.status]?.icon}
                                                    <span className="ml-1">{statusConfig[shift.status]?.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => viewShiftDetail(shift)}
                                                        className="text-blue-600 hover:text-blue-900 p-1"
                                                        title="Xem chi tiết"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    {shift.status === "PENDING" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(shift.id)}
                                                                className="text-green-600 hover:text-green-900 p-1"
                                                                title="Phê duyệt"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(shift.id)}
                                                                className="text-red-600 hover:text-red-900 p-1"
                                                                title="Từ chối"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Hiển thị{" "}
                                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                    {" "}-{" "}
                                    <span className="font-medium">
                                        {Math.min(currentPage * itemsPerPage, filteredShifts.length)}
                                    </span>
                                    {" "}trong{" "}
                                    <span className="font-medium">{filteredShifts.length}</span> kết quả
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === page
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedShift && (
                <ShiftDetailModal
                    shift={selectedShift}
                    onClose={() => setIsModalOpen(false)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
};

export default ShiftHandoverManager;
