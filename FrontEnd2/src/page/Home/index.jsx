import React from 'react';
import Slider from "./Slider";
import QuickAccessCategories from "./content/QuickAccessCategories";
import { useHomepageData } from "../../hooks/useHomepageData";
import ProductCard from "../../components/Product/ProductCard";

// Component hiển thị danh sách sản phẩm
const ProductSection = ({ title, products, loading, error }) => {
    if (loading) return <div className="text-center py-8">Đang tải {title}...</div>;
    if (error) return <div className="text-center text-red-500 py-8">Lỗi tải dữ liệu: {error}</div>;
    if (!products || products.length === 0) return <div className="text-center py-8">Không tìm thấy {title}.</div>;

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-primary">{title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};


function Home() {
    const { bestsellers, seasonalProducts, loading, error } = useHomepageData();

    return (
        <div className="container mx-auto px-4">
            <Slider/>
            
            {/* 1. Danh mục Truy cập Nhanh */}
            <QuickAccessCategories />

            {/* 3. Khu vực Ưu đãi & Khuyến mãi (Placeholder) */}
            <div className="my-12 bg-green-100 p-6 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-green-800">Ưu đãi Đặc biệt!</h3>
                <p className="text-green-700 mt-2">Giảm 20% Nông Sản Mùa Hè - Áp dụng cho Cam Sành và Xoài Cát Chu!</p>
            </div>

            {/* 2. Sản phẩm Bán chạy nhất & Đề xuất */}
            <ProductSection
                title="Sản phẩm Bán chạy nhất & Đề xuất"
                products={bestsellers}
                loading={loading}
                error={error}
            />

            {/* 4. Nông sản Theo Mùa */}
            <ProductSection
                title="Nông sản Theo Mùa"
                products={seasonalProducts}
                loading={loading}
                error={error}
            />
        </div>
     );
}

export default Home;