import React, { useState, useEffect } from 'react';
import { request1 } from '../../../utils/request';
import { getCSRFTokenFromCookie } from '../../../Component/Token/getCSRFToken';
import { 
    FaCreditCard, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, 
    FaChartBar, FaFilter, FaEye, FaSpinner, FaMoneyBillWave 
} from 'react-icons/fa';

// Format tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Format ngày
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

// Badge trạng thái
function StatusBadge({ status }) {
    const statusConfig = {
        SUCCESS: { label: 'Thành công', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
        FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
        PENDING: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
        REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-blue-100 text-blue-800', icon: FaMoneyBillWave },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: FaClock };
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="text-xs" />
            {config.label}
        </span>
    );
}

function PaymentManagement() {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const access_token = getCSRFTokenFromCookie("access_token_admin");
    const config = {
        headers: { Authorization: `Bearer ${access_token}` }
    };

    // Fetch transactions
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await request1.get('/v1/admin/payments', config);
            // Sort transactions by createdAt descending (newest first)
            const sorted = Array.isArray(response.data)
                ? [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                : response.data;
            setTransactions(sorted);
            setError(null);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError('Không thể tải danh sách giao dịch');
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
const response = await request1.get('/v1/admin/payments/stats', config);
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchStats();
    }, []);

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const matchFilter = filter === 'all' || t.transactionStatus === filter;
        const matchSearch = !search || 
            t.orderId?.toLowerCase().includes(search.toLowerCase()) ||
            t.vnpTxnRef?.toLowerCase().includes(search.toLowerCase()) ||
            t.vnpTransactionNo?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    // Tính tổng tiền thành công
    const totalSuccess = transactions
        .filter(t => t.transactionStatus === 'SUCCESS')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <FaCreditCard className="text-blue-500" />
                    Quản lý thanh toán VNPAY
                </h1>
                <p className="text-gray-500 mt-1">Theo dõi và quản lý các giao dịch thanh toán</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Tổng giao dịch</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <FaChartBar className="text-3xl text-blue-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Thành công</p>
                            <p className="text-2xl font-bold text-green-600">{stats.success}</p>
                        </div>
                        <FaCheckCircle className="text-3xl text-green-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Thất bại</p>
<p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                        </div>
                        <FaTimesCircle className="text-3xl text-red-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đang xử lý</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <FaClock className="text-3xl text-yellow-500 opacity-50" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-5 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Doanh thu VNPAY</p>
                            <p className="text-lg font-bold text-purple-600">{formatCurrency(totalSuccess)}</p>
                        </div>
                        <FaMoneyBillWave className="text-3xl text-purple-500 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn hàng, mã giao dịch..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            <option value="SUCCESS">Thành công</option>
                            <option value="FAILED">Thất bại</option>
                            <option value="PENDING">Đang xử lý</option>
                        </select>
</div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center">
                        <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto mb-3" />
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-10 text-center">
                        <FaCreditCard className="text-5xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Không có giao dịch nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-600">Mã đơn hàng</th>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-600">Mã GD VNPAY</th>
                                    <th className="text-right py-4 px-4 font-semibold text-gray-600">Số tiền</th>
                                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Ngân hàng</th>
                                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Trạng thái</th>
                                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Thời gian</th>
                                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <p className="font-medium text-gray-800">{transaction.orderId}</p>
                                            <p className="text-xs text-gray-500">{transaction.vnpTxnRef}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-mono text-sm text-gray-700">
                                                {transaction.vnpTransactionNo || '-'}
                                            </p>
</td>
                                        <td className="py-4 px-4 text-right">
                                            <p className="font-semibold text-gray-800">
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <p className="text-gray-700">{transaction.bankCode || '-'}</p>
                                            {transaction.cardType && (
                                                <p className="text-xs text-gray-500">{transaction.cardType}</p>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <StatusBadge status={transaction.transactionStatus} />
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <p className="text-sm text-gray-600">
                                                {formatDate(transaction.createdAt)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => setSelectedTransaction(transaction)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Chi tiết giao dịch</h2>
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
</button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="text-center pb-4 border-b">
                                <StatusBadge status={selectedTransaction.transactionStatus} />
                                <p className="text-3xl font-bold text-gray-800 mt-3">
                                    {formatCurrency(selectedTransaction.amount)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Mã đơn hàng</p>
                                    <p className="font-semibold">{selectedTransaction.orderId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Mã tham chiếu</p>
                                    <p className="font-semibold text-sm">{selectedTransaction.vnpTxnRef}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Mã GD VNPAY</p>
                                    <p className="font-semibold">{selectedTransaction.vnpTransactionNo || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Ngân hàng</p>
                                    <p className="font-semibold">{selectedTransaction.bankCode || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Loại thẻ</p>
                                    <p className="font-semibold">{selectedTransaction.cardType || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Ngày TT</p>
                                    <p className="font-semibold">{selectedTransaction.payDate || '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Thời gian tạo</p>
                                    <p className="font-semibold">{formatDate(selectedTransaction.createdAt)}</p>
                                </div>
                                {selectedTransaction.orderInfo && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500">Nội dung</p>
                                        <p className="text-sm">{selectedTransaction.orderInfo}</p>
                                    </div>
                                )}
                            </div>
</div>

                        <div className="p-6 bg-gray-50 border-t">
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentManagement;