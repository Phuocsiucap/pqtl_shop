// src/data/mockData.js
import { AlertCircle, Package, ShoppingCart } from "lucide-react";

export const mockData = {
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
  ],
  recentOrders: [
    { id: 1, code: "DH001", customer: "Nguyễn Thị Mai", total: 450000, status: "Đang giao", date: "2025-10-14", items: "5 sản phẩm" },
    { id: 2, code: "DH002", customer: "Trần Văn Nam", total: 890000, status: "Đã xác nhận", date: "2025-10-14", items: "8 sản phẩm" },
  ],
  lowStockProducts: [
    { name: "Dưa chuột baby", stock: 8, min: 20, expiry: "2025-10-16", status: "critical" },
    { name: "Cá hồi Na Uy", stock: 5, min: 15, expiry: "2025-10-15", status: "critical" },
  ],
  alerts: [
    { type: "danger", message: "6 sản phẩm sắp hết hạn trong 3 ngày tới", icon: AlertCircle },
    { type: "warning", message: "12 sản phẩm tồn kho dưới mức tối thiểu", icon: Package },
    { type: "info", message: "18 đơn hàng mới cần xử lý hôm nay", icon: ShoppingCart }
  ]
};
