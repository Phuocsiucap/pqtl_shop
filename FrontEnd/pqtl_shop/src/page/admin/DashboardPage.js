import React from "react";
import KpiCard from "../../components/admin/dashboard/KpiCard";
import RevenueChart from "../../components/admin/dashboard/RevenueChart";
import TopProductsChart from "../../components/admin/dashboard/TopProductsChart";
import OrderTable from "../../components/admin/dashboard/OrderTable";
import LowStockAlert from "../../components/admin/dashboard/LowStockAlert";
import { mockData } from "../../data/mockData";
import { 
  DollarSignIcon, 
  ShoppingCartIcon, 
  PackageIcon, 
  AlertCircleIcon, 
  BoxIcon, 
  UsersIcon 
} from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <KpiCard icon={DollarSignIcon} title="Doanh thu" value={`${(mockData.stats.totalRevenue / 1000000).toFixed(1)}M`} />
        <KpiCard icon={ShoppingCartIcon} title="Đơn hàng" value={mockData.stats.totalOrders} />
        <KpiCard icon={PackageIcon} title="Sản phẩm bán chạy" value={mockData.stats.topProductSales} subtitle={mockData.stats.topProduct} />
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
        <LowStockAlert products={mockData.lowStockProducts} />
      </div>
    </>
  );
}