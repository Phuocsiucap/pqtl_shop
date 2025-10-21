import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Customer pages
import HomePage from "./page/customer/home";
import ProductPage from "./page/customer/ProductPage";
import ProductsPage from "./components/SearchProduct/ProductsPage";
import LoginPage from './page/login/Login';
import Register from './page/login/Register';
import VerifyPage from './page/login/Verify';

// Admin pages
import Dashboard from "./page/admin/bestSellingDashboard";
import AdminLayout from './components/admin/layout/Layout';
import AdminDashboard from './page/admin/DashboardPage';
import OrdersPage from './page/admin/OrdersPage';
import UsersPage from './page/admin/UsersPage';
import ClearancePage from './page/admin/ClearancePage';
import ExpiredProductsPage from './page/admin/ExpiredProductsPage';
import InventoryPage from './page/admin/InventoryPage';
import RevenuePage from './page/admin/RevenuePage';
import BestSellersPage from './page/admin/BestSellersPage';

// Provider
import { BestSellingProvider } from "./context/BestSellingContext";

function App() {
  return (
    <BestSellingProvider>
      <Router>
        <Routes>
          {/* Customer pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/products/search" element={<ProductsPage />} /> {/* ← Route tìm kiếm */}

          {/* Admin pages */}
          <Route path="/admin" element={<AdminLayout/>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="clearance" element={<ClearancePage />} />
            <Route path="expired" element={<ExpiredProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="best-sellers" element={<BestSellersPage />} />
          </Route>

          <Route path="/admin/dashboard" element={<Dashboard />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </Router>
    </BestSellingProvider>
  );
}

export default App;
