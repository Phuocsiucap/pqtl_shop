import { Link } from 'react-router-dom';
import { FaLeaf, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import video1 from '../../../assets/video/Kịch_Bản_TVC_Rau_Sạch_s.mp4';
import video2 from '../../../assets/video/Kịch_bản_TVC_rau_sạch_s2.mp4';
import video3 from '../../../assets/video/20251222_0246_01kd16t2skf1q9da077zex507j.mp4';
import video4 from '../../../assets/video/20251222_0246_01kd16t68ce8dasztqsc3n27yj.mp4';

function HeroBanner() {
    const [currentVideo, setCurrentVideo] = useState(0);
    const videoRef = useRef(null);

    const videos = [
        { src: video1, title: "Nông sản tươi sạch từ trang trại" },
        { src: video2, title: "Chất lượng hữu cơ 100%" },
        { src: video3, title: "Trải nghiệm mua sắm tuyệt vời" },
        { src: video4, title: "Dịch vụ giao hàng tận nơi" }
    ];

    const nextVideo = () => {
        setCurrentVideo((prev) => (prev + 1) % videos.length);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            nextVideo();
        }, 8000); // Chuyển video sau 8 giây để có thời gian xem đủ 4 video

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full">
            {/* Main Banner with Video */}
            <div className="relative h-[420px] md:h-[520px] overflow-hidden">
                <video
                    ref={videoRef}
                    src={videos[currentVideo].src}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                    onLoadedData={() => {
                        if (videoRef.current) {
                            videoRef.current.play();
                        }
                    }}
                />

                {/* Video Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {videos.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentVideo(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                                index === currentVideo ? 'bg-white' : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>

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
