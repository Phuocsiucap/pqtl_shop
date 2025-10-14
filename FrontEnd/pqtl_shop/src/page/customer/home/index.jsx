import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import Header from '../../../components/customer/homepage/Header';
import Banner from '../../../components/customer/homepage/Banner';
import CategoryList from '../../../components/customer/homepage/CategoryList';
import LoyaltyBanner from '../../../components/customer/homepage/LoyaltyBanner';
import Footer from '../../../components/customer/homepage/Footer';
import ProductSection from '../../../common/ProducSection';

// Mock Data - Thực phẩm sạch
const mockData = {
  user: { name: "Trần Thị Bích", points: 420, tier: "Gold", isLoggedIn: true },
  banners: [
    { title: "Tuần lễ rau củ organic", subtitle: "Giảm đến 30% cho đơn hàng từ 200k", cta: "Mua ngay", color: "from-green-500 to-lime-500" },
    { title: "Trái cây nhập khẩu tươi mỗi ngày", subtitle: "Miễn phí giao hàng nội thành", cta: "Xem ngay", color: "from-yellow-500 to-orange-500" },
    { title: "Gạo sạch Việt Nam", subtitle: "Chất lượng cao – giá tốt – an toàn", cta: "Khám phá", color: "from-amber-500 to-green-600" }
  ],
  categories: [
    { name: "Rau củ", icon: "🥦", count: 120 },
    { name: "Trái cây", icon: "🍎", count: 90 },
    { name: "Thịt – Cá", icon: "🐟", count: 70 },
    { name: "Sữa & Trứng", icon: "🥚", count: 45 },
    { name: "Gạo – Ngũ cốc", icon: "🌾", count: 60 },
    { name: "Gia vị – Dầu ăn", icon: "🧂", count: 55 }
  ],
  products: {
    new: [
      { id: 1, name: "Rau cải xanh hữu cơ", price: 25000, discount: 0.1, rating: 4.8, reviews: 112, isNew: true, image: "🥬", stock: 100 },
      { id: 2, name: "Cà chua Đà Lạt", price: 30000, discount: 0.05, rating: 4.6, reviews: 89, isNew: true, image: "🍅", stock: 80 },
      { id: 3, name: "Dâu tây tươi Hàn Quốc", price: 180000, discount: 0.15, rating: 4.9, reviews: 142, isNew: true, image: "🍓", stock: 40 },
      { id: 4, name: "Trứng gà ta hữu cơ", price: 40000, discount: 0, rating: 4.7, reviews: 73, isNew: true, image: "🥚", stock: 60 }
    ],
    sale: [
      { id: 5, name: "Thịt bò Úc cao cấp", price: 350000, discount: 0.25, rating: 4.8, reviews: 220, isHot: true, image: "🥩", stock: 25 },
      { id: 6, name: "Cá hồi phi lê Na Uy", price: 450000, discount: 0.3, rating: 4.9, reviews: 180, isHot: true, image: "🐟", stock: 18 },
      { id: 7, name: "Sữa tươi hữu cơ", price: 35000, discount: 0.2, rating: 4.7, reviews: 134, isHot: true, image: "🥛", stock: 40 },
      { id: 8, name: "Mật ong nguyên chất", price: 120000, discount: 0.35, rating: 4.8, reviews: 165, isHot: true, image: "🍯", stock: 30 }
    ],
    hot: [
      { id: 9, name: "Gạo ST25 hữu cơ", price: 28000, discount: 0.1, rating: 4.9, reviews: 512, isBestSeller: true, image: "🌾", stock: 100 },
      { id: 10, name: "Cam sành miền Tây", price: 45000, discount: 0.15, rating: 4.6, reviews: 430, isBestSeller: true, image: "🍊", stock: 70 },
      { id: 11, name: "Cà rốt Đà Lạt", price: 30000, discount: 0, rating: 4.5, reviews: 298, isBestSeller: true, image: "🥕", stock: 85 },
      { id: 12, name: "Dầu oliu nguyên chất", price: 180000, discount: 0.2, rating: 4.7, reviews: 214, isBestSeller: true, image: "🫒", stock: 50 }
    ]
  },
  recentlyViewed: [
    { id: 13, name: "Khoai lang tím", price: 25000, discount: 0, rating: 4.5, image: "🍠" },
    { id: 14, name: "Sữa chua Hy Lạp", price: 35000, discount: 0.1, rating: 4.7, image: "🍶" }
  ]
};

// Main App
export default function CustomerHomepage() {
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState(null);

  const handleAddToCart = (product) => {
    setCartCount((prev) => prev + 1);
    setNotification(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Header user={mockData.user} cartCount={cartCount} />

      {notification && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          ✓ {notification}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Banner banners={mockData.banners} />

        <div className="my-12">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Danh mục thực phẩm</h2>
          <CategoryList categories={mockData.categories} />
        </div>

        {mockData.user.isLoggedIn && <LoyaltyBanner user={mockData.user} />}

        <ProductSection
          title="Sản phẩm mới"
          icon={<span className="text-3xl">🌱</span>}
          products={mockData.products.new}
          onAddToCart={handleAddToCart}
        />

        <ProductSection
          title="Khuyến mãi hot"
          icon={<span className="text-3xl">🔥</span>}
          products={mockData.products.sale}
          onAddToCart={handleAddToCart}
        />

        <ProductSection
          title="Sản phẩm bán chạy"
          icon={<TrendingUp size={32} className="text-green-700" />}
          products={mockData.products.hot}
          onAddToCart={handleAddToCart}
        />

        {mockData.recentlyViewed.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6">👀 Bạn đã xem gần đây</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mockData.recentlyViewed.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="bg-green-100 h-32 flex items-center justify-center text-4xl mb-2">
                    {product.image}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.name}</p>
                  <p className="text-sm text-green-700 font-bold mt-1">
                    {(product.price * (1 - product.discount)).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
