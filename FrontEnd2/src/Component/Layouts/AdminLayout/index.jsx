import FooterAdmin from "./FooterAdmin";
import HeaderAdmin from "./HeaderAdmin";
import Sidebar from "./Navbar";
import Sidebar1 from "./Navbar2";
function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="basis-[20%] h-full">
        <Sidebar1 />
      </div>
      <div className="flex flex-col h-full font-Montserrat basis-[80%]">
        <HeaderAdmin />

        <div className="bg-gray-50 w-full flex-1 overflow-y-auto p-4">{children}</div>
        {/* <FooterAdmin /> */}
      </div>
    </div>
  );
}

export default AdminLayout;
