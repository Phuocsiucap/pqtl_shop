import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BiCategory, BiChevronDown, BiChevronUp } from "react-icons/bi";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  // Get category from URL query params
  const urlParams = new URLSearchParams(location.search);
  const selectedCategory = urlParams.get("category");

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update selected category when URL changes
  useEffect(() => {
    // This will trigger re-render when location.search changes
  }, [location.search]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await request1.get("v1/categories/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback to default categories
      setCategories([
        { id: "1", name: "Trái Cây Tươi" },
        { id: "2", name: "Rau Ăn Hữu Cơ" },
        { id: "3", name: "Củ Quả & Gia Vị" },
        { id: "4", name: "Thịt & Trứng Sạch" },
        { id: "5", name: "Hải Sản Tươi" },
        { id: "6", name: "Thực Phẩm Khô" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    // Navigate to product management page with category filter
    // This will trigger the ProductList to filter products by this category
    navigate(`/admin/managegood?category=${encodeURIComponent(categoryName)}`);
  };
  
  // Highlight active category
  const isCategoryActive = (categoryName) => {
    return selectedCategory && decodeURIComponent(selectedCategory) === categoryName;
  };

  if (loading) {
    return (
      <div className="mt-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <BiCategory className="text-xl text-blue-600" />
          <h3 className="text-blue-600 text-lg font-semibold uppercase tracking-wide">
            Danh mục sản phẩm
          </h3>
        </div>
        {isExpanded ? (
          <BiChevronUp className="text-gray-500" />
        ) : (
          <BiChevronDown className="text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <ul className="space-y-2 ml-4">
          {categories.map((category) => {
            const isActive = isCategoryActive(category.name);
            return (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className={`w-full text-left py-2 px-4 rounded-lg transition-all duration-300 ease-in-out ${
                    isActive
                      ? "bg-blue-100 text-blue-600 font-semibold border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                  title={`Xem tất cả sản phẩm trong danh mục ${category.name}`}
                >
                  {category.name}
                  {isActive && (
                    <span className="ml-2 text-xs">✓</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CategorySidebar;

