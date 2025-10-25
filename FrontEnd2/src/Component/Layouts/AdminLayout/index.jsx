import FooterAdmin from "./FooterAdmin";
import HeaderAdmin from "./HeaderAdmin";
import Sidebar from "./Navbar";
import Sidebar1 from "./Navbar2";
function AdminLayout({ children }) {
  return (
    <div className="flex ">
      <div className="basis-[20%] h-full">
        <Sidebar1 />
      </div>
      <div className="h-screen font-Montserrat basis-[80%]">
        <HeaderAdmin />

        <div className=" bg-gray-50 w-full">{children}</div>
        {/* <FooterAdmin /> */}
      </div>
    </div>
  );
}

export default AdminLayout;
