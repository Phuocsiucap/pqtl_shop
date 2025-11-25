import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//page
import HomePage from "./page/customer/home";
import ProductPage from "./page/customer/ProductPage";
import CategoryProductsPage from "./page/customer/category/CategoryProductsPage";
import LoginPage from './page/login/Login';
import Register from './page/login/Register';
import VerifyPage from './page/login/Verify';
import OAuth2Success from './page/login/Oauth';
import CartPage from './page/customer/cart';
// import DashboardPage from './page/admin/DashboardPage';
//admin page
// import Dashboard from "./page/admin/bestSellingDashboard";

import AdminLayout from './components/admin/layout/Layout';
import AdminDashboard from './page/admin/DashboardPage';
import OrdersPage from './page/admin/OrdersPage';
import UsersPage from './page/admin/UsersPage';
import ClearancePage from './page/admin/ClearancePage';
import ExpiredProductsPage from './page/admin/ExpiredProductsPage';
import InventoryPage from './page/admin/InventoryPage';
import RevenuePage from './page/admin/RevenuePage';
import BestSellersPage from './page/admin/BestSellersPage';
import ProductSalesStatistics from './page/admin/ProductSalesStatisticsPage';



//provider

import { BestSellingProvider } from "./context/BestSellingContext";
import { CartProvider } from './context/CartContext';
function App() {
  return (
    <BestSellingProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/category/:slug" element={<CategoryProductsPage />} />
            <Route path="/cart" element={<CartPage/>} />

            <Route path="/admin" element={<AdminLayout/>}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="clearance" element={<ClearancePage />} />
              <Route path="expired" element={<ExpiredProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="best-sellers" element={<BestSellersPage />} />
              <Route path="sales-statistics" element={<ProductSalesStatistics/>}/>
            </Route>

          {/* <Route path="/admin/dashboard" element={<Dashboard />} /> */}

           {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/oauth" element={<OAuth2Success/>} />
          
        </Routes>
      </Router>
      </CartProvider>
    </BestSellingProvider>
  );
}

export default App;
