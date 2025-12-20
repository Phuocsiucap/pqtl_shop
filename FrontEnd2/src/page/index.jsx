import { Defaultlayout } from "../Component/Layouts"
import AdminLayout from "../Component/Layouts/AdminLayout"
import About from "./About"
import SearchResultPage from "./SearchResultPage"
// import Cartshopping from "./Cartshopping"
import Home from "./Home"
import Login from "./Login"
import Products from "./Product"
import ProductDetail from "./Product/ProductDetail"
import Regester from "./Regester"
import Profile from "./Profile"
import SaleProducts from "./SaleProducts"
import Order from "./Oder"
import BuildDetail from "./BuildDetail"
import CartShopping from "./Cartshopping/cartShpping"
import AdminHome from "./Admin/AdminHome"
import ManagementUser from "./Admin/ManaUser"
import ManagementBill from "./Admin/ManaBill"
import DetailModal from "./Admin/ManaBill/DetailModal"
import ManagementGood from "./Admin/ManaGood/indes"
import ManagementCategory from "./Admin/ManaCategory"
import ManagementVoucher from "./Admin/ManaVoucher"
import LoginForm from "./Admin/LoginAdmin"
import BestSellerList from "./Admin/BestSeller"
import FinancialReport from "./Admin/FinancialReport"
import ClearanceManager from "./Admin/ClearanceManager"
import ClearanceProducts from "./ClearanceProducts"
import OAuth2RedirectHandler from "./OAuth2RedirectHandler";
import ShiftHandoverManager from "./Admin/ShiftHandover";
import EmployeeShiftHandover from "./Admin/EmployeeShift";
import POSSales from "./Admin/POSSales";
import ReviewManagement from "./Admin/ReviewManagement";
import PaymentManagement from "./Admin/PaymentManagement";
import PaymentReturn from "./Oder/PaymentReturn";
import withRoleCheck from "../components/withRoleCheck";

// Wrap các trang chỉ dành cho ADMIN
const AdminOnlyHome = withRoleCheck(AdminHome, ["ADMIN"]);
const AdminOnlyManageUser = withRoleCheck(ManagementUser, ["ADMIN"]);
const AdminOnlyBestSeller = withRoleCheck(BestSellerList, ["ADMIN"]);
const AdminOnlyFinancialReport = withRoleCheck(FinancialReport, ["ADMIN"]);
const AdminOnlyClearance = withRoleCheck(ClearanceManager, ["ADMIN"]);
const AdminOnlyVoucher = withRoleCheck(ManagementVoucher, ["ADMIN"]);
const AdminOnlyShiftHandover = withRoleCheck(ShiftHandoverManager, ["ADMIN"]);

// Các trang STAFF + ADMIN đều truy cập được
const StaffAndAdminGoods = withRoleCheck(ManagementGood, ["ADMIN", "STAFF"]);
const StaffAndAdminCategory = withRoleCheck(ManagementCategory, ["ADMIN", "STAFF"]);
const StaffAndAdminManageBill = withRoleCheck(ManagementBill, ["ADMIN", "STAFF"]);
const StaffAndAdminBillDetail = withRoleCheck(DetailModal, ["ADMIN", "STAFF"]);
const StaffAndAdminEmployeeShift = withRoleCheck(EmployeeShiftHandover, ["ADMIN", "STAFF"]);
const StaffAndAdminPOS = withRoleCheck(POSSales, ["ADMIN", "STAFF"]);
const StaffAndAdminReviews = withRoleCheck(ReviewManagement, ["ADMIN", "STAFF"]);
const StaffAndAdminPayments = withRoleCheck(PaymentManagement, ["ADMIN", "STAFF"]);

const PublicPage = [
    { path: "/", component: Home, layout: Defaultlayout },
    { path: "/products/:id", component: ProductDetail, layout: Defaultlayout },
    { path: "/search", component: SearchResultPage, layout: Defaultlayout },
    { path: "/category/:slug", component: SearchResultPage, layout: Defaultlayout },
    // {path:"/cartshopping", component: Cartshopping, layout: Defaultlayout},
    { path: "/cartshopping", component: CartShopping, layout: Defaultlayout },
    { path: "/about", component: About, layout: Defaultlayout },
    { path: "/profile", component: Profile, layout: Defaultlayout },
    { path: "/saleproduct", component: SaleProducts, layout: Defaultlayout },
    { path: "/clearance", component: ClearanceProducts, layout: Defaultlayout },
    { path: "/order", component: Order, layout: Defaultlayout },
    { path: "/buildDetail/:id", component: BuildDetail, layout: Defaultlayout },
    { path: "/payment-return", component: PaymentReturn, layout: null },
    { path: "/login", component: Login, layout: null },
    { path: "/regester", component: Regester, layout: null },
    // admin
    { path: "/admin/login", component: LoginForm, layout: null },
    { path: "/admin", component: AdminOnlyHome, layout: AdminLayout },
    { path: "/admin/manageuser", component: AdminOnlyManageUser, layout: AdminLayout },
    { path: "/admin/managegood", component: StaffAndAdminGoods, layout: AdminLayout },
    { path: "/admin/managecategory", component: StaffAndAdminCategory, layout: AdminLayout },
    { path: "/admin/managebill", component: StaffAndAdminManageBill, layout: AdminLayout },
    { path: "/admin/managebill/billdetail", component: StaffAndAdminBillDetail, layout: AdminLayout },
    { path: "/admin/bestseller", component: AdminOnlyBestSeller, layout: AdminLayout },
    { path: "/admin/financial-report", component: AdminOnlyFinancialReport, layout: AdminLayout },
    { path: "/admin/clearance", component: AdminOnlyClearance, layout: AdminLayout },
    { path: "/admin/managevoucher", component: AdminOnlyVoucher, layout: AdminLayout },
    { path: "/admin/shift-handover", component: AdminOnlyShiftHandover, layout: AdminLayout },
    { path: "/admin/employee-shift", component: StaffAndAdminEmployeeShift, layout: AdminLayout },
    { path: "/admin/pos", component: StaffAndAdminPOS, layout: AdminLayout },
    { path: "/admin/reviews", component: StaffAndAdminReviews, layout: AdminLayout },
    { path: "/admin/payments", component: StaffAndAdminPayments, layout: AdminLayout },
    { path: "/oauth2/success", component: OAuth2RedirectHandler, layout: null },

]
const PrivatePage = [

]
export { PrivatePage, PublicPage }
