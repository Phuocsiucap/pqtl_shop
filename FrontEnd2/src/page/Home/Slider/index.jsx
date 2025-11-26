import { Link } from 'react-router-dom';
import { FaLeaf, FaTruck, FaShieldAlt } from 'react-icons/fa';
import bannerImage from '../../../assets/images/Titel_1.jpg';

function HeroBanner() {
    return (
        <div className="relative w-full">
            {/* Main Banner */}
            <div className="relative h-[350px] md:h-[450px] overflow-hidden">
                <img
                    src={bannerImage}
                    alt="Nông sản tươi sạch"
                    className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-6 md:px-12">
                        <div className="max-w-2xl text-white">
                            <div className="inline-block px-4 py-2 bg-primary/90 rounded-full mb-4">
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <FaLeaf /> 100% Hữu Cơ
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                                Nông Sản Tươi Sạch
                                <br />
                                <span className="text-yellow-400">Từ Trang Trại</span>
                            </h1>
                            <p className="text-lg md:text-xl mb-8 text-gray-100">
                                Thực phẩm sạch, an toàn cho sức khỏe gia đình bạn
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/products"
                                    className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Mua Ngay
                                </Link>
                                <Link
                                    to="/saleproduct"
                                    className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                                >
                                    Ưu Đãi Hôm Nay
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Bar */}
            <div className="bg-white border-t border-b border-gray-200 py-6">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaLeaf className="text-primary text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">100% Hữu Cơ</h3>
                                <p className="text-sm text-gray-600">Không hóa chất, an toàn</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaTruck className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Giao Hàng Nhanh</h3>
                                <p className="text-sm text-gray-600">Miễn phí trong 24h</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaShieldAlt className="text-orange-600 text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Đảm Bảo Chất Lượng</h3>
                                <p className="text-sm text-gray-600">Hoàn tiền 100% nếu không hài lòng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroBanner;
