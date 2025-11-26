import React from 'react';
import HeroBanner from "./Slider"; // File is Slider/index.jsx but exports HeroBanner
import QuickAccessCategories from "./content/QuickAccessCategories";
import { useHomepageData } from "../../hooks/useHomepageData";
import ProductCard from "../../components/Product/ProductCard";

// Component hiển thị danh sách sản phẩm
const ProductSection = ({ title, products, loading, error }) => {
    if (loading) return <div className="text-center py-8">Đang tải {title}...</div>;
    if (error) return <div className="text-center text-red-500 py-8">Lỗi tải dữ liệu: {error}</div>;

    // Đảm bảo products là mảng trước khi kiểm tra length và map
    const productsArray = Array.isArray(products) ? products : (products === null ? [] : []);

    // Debug log
    console.log(`ProductSection ${title} - products:`, products);
    console.log(`ProductSection ${title} - productsArray:`, productsArray);
    console.log(`ProductSection ${title} - productsArray.length:`, productsArray.length);

    if (productsArray.length === 0) {
        return (
            <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6 text-primary">{title}</h2>
                <div className="text-center py-8 text-gray-500">
                    Không tìm thấy {title}.
                    <br />
                    <small className="text-sm">(Có thể database chưa có dữ liệu hoặc API chưa được cấu hình đúng)</small>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-primary">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {productsArray.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};


function Home() {
    const { bestsellers, seasonalProducts, loading, error } = useHomepageData();

    // Debug log
    console.log('Home Component - Bestsellers:', bestsellers);
    console.log('Home Component - Seasonal Products:', seasonalProducts);
    console.log('Home Component - Loading:', loading);
    console.log('Home Component - Error:', error);

    return (
        <div>
            <HeroBanner />

            <div className="container mx-auto px-4">
                {/* 1. Danh mục Truy cập Nhanh */}
                <QuickAccessCategories />

                {/* 2. Sản phẩm Bán chạy nhất & Đề xuất */}
                <ProductSection
                    title="Sản phẩm Bán chạy nhất & Đề xuất"
                    products={bestsellers}
                    loading={loading}
                    error={error}
                />

                {/* 3. Nông sản Theo Mùa */}
                <ProductSection
                    title="Nông sản Theo Mùa"
                    products={seasonalProducts}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
}

export default Home;