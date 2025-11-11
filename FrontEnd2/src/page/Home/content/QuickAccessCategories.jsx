import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
    { name: "Trái Cây Tươi", image: "Image2.jpg", link: "/search?category=Trái Cây Tươi" },
    { name: "Rau Ăn Lá Hữu Cơ", image: "url_rauanla.jpg", link: "/search?category=Rau Ăn Lá Hữu Cơ" },
    { name: "Củ Quả & Gia Vị", image: "url_cuqua.jpg", link: "/search?category=Củ Quả & Gia Vị" },
    { name: "Thịt & Trứng Sạch", image: "url_thit.jpg", link: "/search?category=Thịt & Trứng Sạch" },
    { name: "Hải Sản Tươi", image: "url_haisan.jpg", link: "/search?category=Hải Sản Tươi" },
    { name: "Thực Phẩm Khô", image: "url_thucphamkho.jpg", link: "/search?category=Thực Phẩm Khô" },
];

function QuickAccessCategories() {
    return (
        <div className="mt-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Danh mục Truy cập Nhanh</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category, index) => (
                    <Link to={category.link} key={index} className="block">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:scale-105">
                            <img 
                                src={category.image} 
                                alt={category.name} 
                                className="w-full h-32 object-cover" 
                            />
                            <div className="p-3 text-center">
                                <p className="text-sm font-semibold text-gray-800">{category.name}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default QuickAccessCategories;