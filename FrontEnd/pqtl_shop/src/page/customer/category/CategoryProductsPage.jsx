import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ChevronRight,
  Filter,
  Grid3x3,
  Loader2,
  Star,
} from "lucide-react";
import Header from "../../../components/customer/homepage/Header";
import Footer from "../../../components/customer/homepage/Footer";
import {
  fetchCategories,
  fetchProductsByCategory,
} from "../../../services/catalogAPI";

const priceRanges = [
  { label: "Tất cả mức giá", value: "all" },
  { label: "Dưới 50.000đ", value: "under-50", min: 0, max: 50000 },
  {
    label: "50.000đ - 100.000đ",
    value: "50-100",
    min: 50000,
    max: 100000,
  },
  {
    label: "100.000đ - 200.000đ",
    value: "100-200",
    min: 100000,
    max: 200000,
  },
  { label: "Trên 200.000đ", value: "above-200", min: 200000 },
];

const sortOptions = [
  { value: "featured", label: "Nổi bật" },
  { value: "best-selling", label: "Bán chạy" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao" },
];

const slugify = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const Breadcrumbs = ({ items }) => (
  <nav className="text-sm text-gray-500 flex items-center flex-wrap gap-2">
    {items.map((item, index) => (
      <React.Fragment key={item.label}>
        {index !== 0 && <ChevronRight size={14} className="text-gray-300" />}
        {item.path ? (
          <Link to={item.path} className="hover:text-green-600">
            {item.label}
          </Link>
        ) : (
          <span className="text-gray-700 font-semibold">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

const CategoryProductsPage = () => {
  const { slug } = useParams();
  const location = useLocation();

  const [categoryName, setCategoryName] = useState("Danh mục");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOption, setSortOption] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Load data when slug changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categories = await fetchCategories();
        const matchedCategory =
          categories.find(
            (cat) =>
              cat.slug === slug ||
              slugify(cat.name) === slug ||
              cat.name === location.state?.categoryName
          ) || location.state?.categoryName
            ? {
                name: location.state.categoryName,
                slug,
              }
            : null;

        const displayName =
            matchedCategory?.name ||
            slug
              ?.split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ") ||
            "Danh mục";
        setCategoryName(displayName);

        const productResponse = await fetchProductsByCategory(displayName, {
          size: 200,
        });
        const items = productResponse?.content || productResponse || [];
        setProducts(items);
        setCurrentPage(1);
      } catch (err) {
        console.error(err);
        setError(
          "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau hoặc liên hệ hỗ trợ."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, location.state]);

  const brandOptions = useMemo(() => {
    const brands = new Set(
      products
        .map((product) => product.brand)
        .filter(Boolean)
    );
    return Array.from(brands);
  }, [products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOption, priceFilter, selectedBrands]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedBrands.length) {
      result = result.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    if (priceFilter !== "all") {
      const range = priceRanges.find((range) => range.value === priceFilter);
      if (range) {
        const { min = 0, max } = range;
        result = result.filter((product) => {
          const finalPrice = product.price - (product.discount || 0);
          if (max) {
            return finalPrice >= min && finalPrice <= max;
          }
          return finalPrice >= min;
        });
      }
    }

    const sortFn = {
      "price-asc": (a, b) =>
        a.price - (a.discount || 0) - (b.price - (b.discount || 0)),
      "price-desc": (a, b) =>
        b.price - (b.discount || 0) - (a.price - (a.discount || 0)),
      "best-selling": (a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0),
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      featured: () =>
        (Math.random() > 0.5 ? 1 : -1), // giữ giao diện sinh động khi chưa có logic nổi bật
    };

    const sortFunc = sortFn[sortOption] || sortFn.featured;
    return result.sort(sortFunc);
  }, [products, selectedBrands, priceFilter, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize
  );

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setPriceFilter("all");
    setSortOption("featured");
  };

  return (
    <div className="bg-green-50 min-h-screen">
      <Header user={{ isLoggedIn: false }} />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <section className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Trang chủ", path: "/" },
              { label: categoryName },
            ]}
          />
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-green-600 font-semibold uppercase tracking-widest">
                Danh mục
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                {categoryName}
              </h1>
              <p className="text-gray-500 mt-2">
                Có {filteredProducts.length} sản phẩm phù hợp với lựa chọn của
                bạn.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-500">Sắp xếp theo</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow p-6 space-y-6">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <Filter size={18} />
                Bộ lọc chi tiết
              </div>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-500 hover:text-blue-700 underline"
              >
                Đặt lại bộ lọc
              </button>

              {brandOptions.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-800 mb-3">Thương hiệu</p>
                  <div className="space-y-2">
                    {brandOptions.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="font-semibold text-gray-800 mb-3">Khoảng giá</p>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label
                      key={range.value}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <input
                        type="radio"
                        name="price"
                        value={range.value}
                        checked={priceFilter === range.value}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <section className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-green-600" />
                <p className="mt-4 text-gray-500">
                  Đang tải sản phẩm, vui lòng chờ...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-6">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
                Không có sản phẩm nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedProducts.map((product) => {
                    const finalPrice = product.price - (product.discount || 0);
                    return (
                      <article
                        key={product.id}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden"
                      >
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 h-56 flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={product.image.startsWith("http") ? product.image : `http://127.0.0.1:8080/api/${product.image}`}
                              alt={product.name}
                              className="object-cover h-full w-full"
                              loading="lazy"
                            />
                          ) : (
                            <Grid3x3 className="text-green-400" size={48} />
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <p className="text-xs uppercase text-gray-400 tracking-widest">
                            {product.brand || "Thương hiệu nội địa"}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2 min-h-[3.2rem]">
                            {product.name}
                          </h3>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-green-600 font-bold text-lg">
                              {formatCurrency(finalPrice)}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatCurrency(product.price)}
                              </span>
                            )}
                          </div>
                          {product.rating && (
                            <div className="flex items-center gap-1 text-sm text-amber-500 mt-2">
                              <Star size={16} fill="currentColor" />
                              <span>{product.rating.toFixed(1)}</span>
                              <span className="text-gray-400">
                                ({product.reviewCount || 0})
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-4 text-sm text-gray-500">
                            <span>
                              {product.stockQuantity > 0
                                ? `${product.stockQuantity} còn hàng`
                                : "Tạm hết hàng"}
                            </span>
                            <Link
                              to={`/product/${product.id}`}
                              className="text-green-600 font-semibold hover:text-green-700"
                            >
                              Xem chi tiết →
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {filteredProducts.length > pageSize && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg border ${
                        currentPage === 1
                          ? "text-gray-300 border-gray-100 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:border-green-400"
                      }`}
                    >
                      Trước
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      const isActive = page === currentPage;
                      // show first, last, current +-1
                      if (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg border ${
                              isActive
                                ? "bg-green-600 text-white border-green-600"
                                : "text-gray-700 border-gray-200 hover:border-green-400"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      if (
                        Math.abs(page - currentPage) === 2 &&
                        page !== 1 &&
                        page !== totalPages
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg border ${
                        currentPage === totalPages
                          ? "text-gray-300 border-gray-100 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:border-green-400"
                      }`}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryProductsPage;

