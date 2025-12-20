import React from 'react';
import HeroBanner from "./Slider"; // File is Slider/index.jsx but exports HeroBanner
import QuickAccessCategories from "./content/QuickAccessCategories";
import { useHomepageData } from "../../hooks/useHomepageData";
import ProductCard from "../../components/Product/ProductCard";
import { FaFire, FaClock, FaLeaf } from "react-icons/fa";

// Component hiển thị danh sách sản phẩm với icon
const ProductSection = ({ title, products, loading, error, icon: Icon, iconColor }) => {
    if (loading) return <div className="text-center py-8">Đang tải {title}...</div>;
    if (error) return <div className="text-center text-red-500 py-8">Lỗi tải dữ liệu: {error}</div>;

    // Đảm bảo products là mảng trước khi kiểm tra length và map
    const productsArray = Array.isArray(products) ? products : (products === null ? [] : []);

    if (productsArray.length === 0) {
        return null; // Không hiển thị section nếu không có sản phẩm
    }

    return (
        <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
                {Icon && <Icon className={`text-2xl ${iconColor || 'text-primary'}`} />}
                <h2 className="text-3xl font-bold text-primary">{title}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {productsArray.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};


function Home() {
    const { bestsellers, newestProducts, seasonalProducts, loading, error } = useHomepageData();

    return (
        <div>
            <HeroBanner />

            <div className="container mx-auto px-4">
                {/* 1. Danh mục Truy cập Nhanh */}
                <QuickAccessCategories />

                {/* 2. Sản phẩm Bán chạy nhất */}
                <ProductSection
                    title="Sản phẩm bán chạy nhất"
                    products={bestsellers}
                    loading={loading}
                    error={error}
                    icon={FaFire}
                    iconColor="text-orange-500"
                />

                {/* 3. Sản phẩm Mới nhất */}
                <ProductSection
                    title="Sản phẩm mới nhất"
                    products={newestProducts}
                    loading={loading}
                    error={error}
                    icon={FaClock}
                    iconColor="text-blue-500"
                />

                {/* 4. Sản phẩm Theo mùa */}
                <ProductSection
                    title="Sản phẩm theo mùa"
                    products={seasonalProducts}
                    loading={loading}
                    error={error}
                    icon={FaLeaf}
                    iconColor="text-green-500"
                />
            </div>
        </div>
    );
}

export default Home;