const Footer = () => (
  <footer className="bg-gray-900 text-white mt-20">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">🛍️ SHOPNAME</h3>
          <p className="text-gray-400 text-sm">
            Cửa hàng thời trang trực tuyến uy tín, chất lượng hàng đầu Việt Nam.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-white cursor-pointer">Chính sách bảo hành</li>
            <li className="hover:text-white cursor-pointer">Chính sách đổi trả</li>
            <li className="hover:text-white cursor-pointer">Hướng dẫn mua hàng</li>
            <li className="hover:text-white cursor-pointer">Câu hỏi thường gặp</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Về chúng tôi</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-white cursor-pointer">Giới thiệu</li>
            <li className="hover:text-white cursor-pointer">Liên hệ</li>
            <li className="hover:text-white cursor-pointer">Tuyển dụng</li>
            <li className="hover:text-white cursor-pointer">Tin tức</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Kết nối với chúng tôi</h4>
          <div className="flex gap-4 mb-4">
            <button className="bg-blue-600 p-2 rounded-full hover:bg-blue-700">📘</button>
            <button className="bg-pink-600 p-2 rounded-full hover:bg-pink-700">📷</button>
            <button className="bg-blue-400 p-2 rounded-full hover:bg-blue-500">💬</button>
          </div>
          <p className="text-sm text-gray-400">Hotline: 1900-xxxx</p>
          <p className="text-sm text-gray-400">Email: support@shopname.vn</p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
        <p>© 2025 SHOPNAME. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
export default Footer;