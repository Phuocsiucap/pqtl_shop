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
import LoginForm from "./Admin/LoginAdmin"
import BestSellerList from "./Admin/BestSeller"
import OAuth2RedirectHandler from "./OAuth2RedirectHandler";

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
    { path: "/order", component: Order, layout: Defaultlayout },
    { path: "/buildDetail/:id", component: BuildDetail, layout: Defaultlayout },
    { path: "/login", component: Login, layout: null },
    { path: "/regester", component: Regester, layout: null },
    // admin
    { path: "/admin/login", component: LoginForm, layout: null },
    { path: "/admin", component: AdminHome, layout: AdminLayout },
    { path: "/admin/manageuser", component: ManagementUser, layout: AdminLayout },
    { path: "/admin/managegood", component: ManagementGood, layout: AdminLayout },
    { path: "/admin/managebill", component: ManagementBill, layout: AdminLayout },
    { path: "/admin/managebill/billdetail", component: DetailModal, layout: AdminLayout },
    { path: "/admin/bestseller", component: BestSellerList, layout: AdminLayout },
    { path: "/oauth2/success", component: OAuth2RedirectHandler, layout: null },

]
const PrivatePage = [

]
export { PrivatePage, PublicPage }