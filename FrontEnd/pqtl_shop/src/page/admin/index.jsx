import React, { useState } from 'react';
import { 
  BarChart3, Package, TrendingUp, AlertTriangle, 
  Users, ShoppingCart, Search, Bell, Menu, X,
  ChevronRight, DollarSign, ArrowUpRight, ArrowDownRight,
  Clock, Box, Archive, Leaf, AlertCircle
} from 'lucide-react';

// Mock Data - Thực phẩm sạch
const mockData = {
  stats: {
    totalRevenue: 85000000,
    revenueChange: 15.3,
    totalOrders: 156,
    ordersChange: 12.8,
    topProduct: "Rau cải xanh hữu cơ",
    topProductSales: 89,
    expiredProducts: 6,
    lowStock: 12,
    activeUsers: 243,
    usersChange: 8.7
  },
  revenueChart: [
    { day: 'T2', value: 12 },
    { day: 'T3', value: 18 },
    { day: 'T4', value: 15 },
    { day: 'T5', value: 22 },
    { day: 'T6', value: 20 },
    { day: 'T7', value: 25 },
    { day: 'CN', value: 28 }
  ],
  topProducts: [
    { name: "Rau cải xanh hữu cơ", sales: 89, revenue: 4450000, unit: "kg" },
    { name: "Thịt gà ta sạch", sales: 45, revenue: 6750000, unit: "kg" },
    { name: "Trứng gà organic", sales: 120, revenue: 3600000, unit: "vỉ" },
    { name: "Cà chua bi hữu cơ", sales: 67, revenue: 2680000, unit: "kg" },
    { name: "Sữa tươi organic", sales: 78, revenue: 3120000, unit: "lít" }
  ],
  recentOrders: [
    { id: 1, code: "DH001", customer: "Nguyễn Thị Mai", total: 450000, status: "Đang giao", date: "2025-10-14", items: "5 sản phẩm" },
    { id: 2, code: "DH002", customer: "Trần Văn Nam", total: 890000, status: "Đã xác nhận", date: "2025-10-14", items: "8 sản phẩm" },
    { id: 3, code: "DH003", customer: "Lê Thị Hoa", total: 320000, status: "Chờ xử lý", date: "2025-10-14", items: "3 sản phẩm" },
    { id: 4, code: "DH004", customer: "Phạm Minh Tuấn", total: 1200000, status: "Hoàn thành", date: "2025-10-13", items: "12 sản phẩm" }
  ],
  lowStockProducts: [
    { name: "Dưa chuột baby", stock: 8, min: 20, expiry: "2025-10-16", status: "critical" },
    { name: "Xà lách xoong", stock: 12, min: 30, expiry: "2025-10-17", status: "warning" },
    { name: "Cá hồi Na Uy", stock: 5, min: 15, expiry: "2025-10-15", status: "critical" },
    { name: "Tôm sú hữu cơ", stock: 10, min: 25, expiry: "2025-10-18", status: "warning" }
  ],
  alerts: [
    { type: "danger", message: "6 sản phẩm sắp hết hạn trong 3 ngày tới", icon: AlertCircle },
    { type: "warning", message: "12 sản phẩm tồn kho dưới mức tối thiểu", icon: Package },
    { type: "info", message: "18 đơn hàng mới cần xử lý hôm nay", icon: ShoppingCart }
  ]
};

const menuItems = [
  { icon: BarChart3, label: "Trang chủ", active: true },
  { icon: TrendingUp, label: "Sản phẩm bán chạy" },
  { icon: DollarSign, label: "Doanh thu" },
  { icon: ShoppingCart, label: "Đơn hàng" },
  { icon: Clock, label: "Sản phẩm quá hạn" },
  { icon: Archive, label: "Thanh lý" },
  { icon: Box, label: "Tồn kho" },
  { icon: Users, label: "Người dùng" }
];

// Components
const KpiCard = ({ icon: Icon, title, value, change, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        {subtitle && <p className="text-sm text-gray-500 mb-2">{subtitle}</p>}
        {change !== undefined && (
          <div className="flex items-center mt-2">
            {change > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Doanh thu tuần này</h3>
          <p className="text-sm text-gray-500 mt-1">Triệu đồng</p>
        </div>
        <button className="text-green-600 text-sm font-semibold hover:text-green-700 flex items-center">
          Xuất báo cáo <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="flex items-end justify-between h-64 gap-3">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="w-full bg-gray-50 rounded-t-xl relative" style={{ height: '100%' }}>
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-xl transition-all group-hover:from-green-700 group-hover:to-green-500 cursor-pointer"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.value}M
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 font-medium">{item.day}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopProductsChart = ({ products }) => {
  const maxSales = Math.max(...products.map(p => p.sales));
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Top sản phẩm bán chạy</h3>
          <p className="text-sm text-gray-500 mt-1">Tuần này</p>
        </div>
        <button className="text-green-600 text-sm font-semibold hover:text-green-700 flex items-center">
          Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-4">
        {products.map((product, index) => {
          const percentage = (product.sales / maxSales) * 100;
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <span className="font-medium text-gray-900">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{product.sales} {product.unit}</p>
                  <p className="text-xs text-gray-500">{(product.revenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderTable = ({ orders }) => {
  const statusColors = {
    "Đang giao": "bg-blue-100 text-blue-700",
    "Đã xác nhận": "bg-green-100 text-green-700",
    "Chờ xử lý": "bg-yellow-100 text-yellow-700",
    "Hoàn thành": "bg-gray-100 text-gray-700"
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Đơn hàng gần nhất</h3>
            <p className="text-sm text-gray-500 mt-1">Cập nhật realtime</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors">
            Tạo đơn mới
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã đơn</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày đặt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{order.code}</span>
                </td>
                <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{order.items}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">
                    {order.total.toLocaleString('vi-VN')}đ
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LowStockAlert = ({ products }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Cảnh báo tồn kho & hạn sử dụng</h3>
          <p className="text-sm text-gray-500 mt-1">Cần xử lý ngay</p>
        </div>
        <button className="text-green-600 text-sm font-semibold hover:text-green-700 flex items-center">
          Quản lý kho <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl border-2 ${
              product.status === 'critical' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-5 h-5 ${
                    product.status === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm mt-2">
                  <span className={`font-medium ${
                    product.status === 'critical' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    Tồn: {product.stock}/{product.min}
                  </span>
                  <span className="text-gray-600">
                    HSD: {product.expiry}
                  </span>
                </div>
              </div>
              <button className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                product.status === 'critical'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}>
                Xử lý
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Trang chủ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Thực phẩm sạch</h1>
                  <p className="text-xs text-gray-500">Trang quản trị</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 w-96">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Tìm sản phẩm, đơn hàng, khách hàng..."
                  className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
              
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Quản trị viên</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 min-h-screen transition-all duration-300 hidden lg:block`}>
          <nav className="p-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveMenu(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeMenu === item.label
                      ? 'bg-green-100 text-green-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {/* Alerts */}
          <div className="mb-6 space-y-3">
            {mockData.alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  alert.type === 'danger' ? 'bg-red-100 text-red-700 border-2 border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200' :
                  'bg-blue-100 text-blue-700 border-2 border-blue-200'
                }`}
              >
                <alert.icon className="w-5 h-5" />
                <span className="text-sm font-medium flex-1">{alert.message}</span>
                <button className="text-sm font-semibold hover:underline">Xem</button>
              </div>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <KpiCard
              icon={DollarSign}
              title="Tổng doanh thu tháng này"
              value={`${(mockData.stats.totalRevenue / 1000000).toFixed(1)}M`}
              change={mockData.stats.revenueChange}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <KpiCard
              icon={ShoppingCart}
              title="Đơn hàng hôm nay"
              value={mockData.stats.totalOrders}
              change={mockData.stats.ordersChange}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <KpiCard
              icon={Package}
              title="Sản phẩm bán chạy nhất"
              value={mockData.stats.topProductSales}
              subtitle={mockData.stats.topProduct}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <KpiCard
              icon={AlertCircle}
              title="Sản phẩm sắp hết hạn"
              value={mockData.stats.expiredProducts}
              color="bg-gradient-to-br from-red-500 to-red-600"
            />
            <KpiCard
              icon={Box}
              title="Cảnh báo tồn kho thấp"
              value={mockData.stats.lowStock}
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            />
            <KpiCard
              icon={Users}
              title="Người dùng hoạt động"
              value={mockData.stats.activeUsers}
              change={mockData.stats.usersChange}
              color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueChart data={mockData.revenueChart} />
            <TopProductsChart products={mockData.topProducts} />
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OrderTable orders={mockData.recentOrders} />
            </div>
            <div>
              <LowStockAlert products={mockData.lowStockProducts} />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2025 Hệ thống quản lý thực phẩm sạch | v1.0.0 | Liên hệ: admin@thucphamsach.vn
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}