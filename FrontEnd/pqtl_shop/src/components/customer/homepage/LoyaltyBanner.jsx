
const LoyaltyBanner = ({ user }) => (
  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-12">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">🎁 Chương trình khách hàng thân thiết</h3>
        <p className="mb-4">Tích điểm - Đổi quà - Nhận ưu đãi độc quyền</p>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <p className="text-sm">Điểm hiện tại</p>
            <p className="text-2xl font-bold">{user.points}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <p className="text-sm">Hạng thành viên</p>
            <p className="text-2xl font-bold">{user.tier}</p>
          </div>
        </div>
      </div>
      <button className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
        Xem ưu đãi của bạn
      </button>
    </div>
  </div>
);
export default LoyaltyBanner;