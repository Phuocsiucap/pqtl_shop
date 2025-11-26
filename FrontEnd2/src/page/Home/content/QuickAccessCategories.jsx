import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../../components/Product/ProductCard';
import { getCategories } from '../../../api/category';
import { request1 } from '../../../utils/request';

const EmojiIcon = ({ emoji, size = 40 }) => (
    <span style={{ fontSize: size, lineHeight: 1, display: 'inline-block' }} role="img" aria-label="icon">
        {emoji}
    </span>
);

const CATEGORY_ICON_MAP = {
    'trai-cay-tuoi': (props) => <EmojiIcon emoji="🍓" {...props} />,
    'rau-an-huu-co': (props) => <EmojiIcon emoji="🥦" {...props} />,
    'cu-qua-gia-vi': (props) => <EmojiIcon emoji="🌶️" {...props} />,
    'thit-trung-sach': (props) => <EmojiIcon emoji="🥩" {...props} />,
    'hai-san-tuoi': (props) => <EmojiIcon emoji="🦐" {...props} />,
    'thuc-pham-kho': (props) => <EmojiIcon emoji="🌾" {...props} />,
};

const DEFAULT_CATEGORY_ICON = (props) => <EmojiIcon emoji="📦" {...props} />;
const PAGE_SIZE = 8;

const normalizeSlug = (value = '') =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

const resolveCategoryIcon = (category) => {
    if (!category) {
        return DEFAULT_CATEGORY_ICON;
    }

    const slug = category.slug || normalizeSlug(category.name || '');
    return CATEGORY_ICON_MAP[slug] || DEFAULT_CATEGORY_ICON;
};

const isSameCategory = (a, b) => {
    if (!a || !b) return false;
    const keys = ['id', '_id', 'slug', 'name'];
    return keys.some((key) => a[key] && b[key] && a[key] === b[key]);
};

function QuickAccessCategories() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [categoryPage, setCategoryPage] = useState(0);
    const [categoryPagination, setCategoryPagination] = useState({
        totalPages: 0,
        totalElements: 0,
    });
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [categoryError, setCategoryError] = useState(null);
    const [productError, setProductError] = useState(null);

    const fetchProductsByCategory = useCallback(async (category, page = 0) => {
        if (!category?.name) return;

        setLoadingProducts(true);
        setProductError(null);

        try {
            const response = await request1.get('v1/search', {
                params: {
                    category: category.name,
                    page,
                    size: PAGE_SIZE,
                },
            });

            const isPagedPayload = !Array.isArray(response.data) && typeof response.data === 'object';
            const rawProducts = Array.isArray(response.data)
                ? response.data
                : response.data?.content || [];
            const totalPages = isPagedPayload ? response.data?.totalPages ?? 1 : 1;
            const totalElements = isPagedPayload ? response.data?.totalElements ?? rawProducts.length : rawProducts.length;

            const normalizedProducts = rawProducts.map((product) => ({
                ...product,
                id: product.id || product._id,
                // image: product.image || placeholderImage, // Removed placeholder image logic for products as we are focusing on category icons
            }));

            setCategoryProducts(normalizedProducts);
            setCategoryPage(page);
            setCategoryPagination({
                totalPages,
                totalElements,
            });
        } catch (error) {
            console.error('Không thể tải sản phẩm theo danh mục:', error);
            setProductError('Không thể tải sản phẩm cho danh mục này. Vui lòng thử lại.');
            setCategoryProducts([]);
            setCategoryPagination({
                totalPages: 0,
                totalElements: 0,
            });
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            setCategoryError(null);
            try {
                const data = await getCategories();
                // Ensure data is always an array
                const categoriesArray = Array.isArray(data) ? data : [];
                setCategories(categoriesArray);

                if (categoriesArray.length > 0) {
                    const firstCategory = categoriesArray[0];
                    setSelectedCategory(firstCategory);
                    fetchProductsByCategory(firstCategory, 0);
                }
            } catch (error) {
                console.error('Không thể tải danh mục:', error);
                setCategoryError('Không thể tải danh mục sản phẩm. Vui lòng thử lại sau.');
                setCategories([]); // Ensure empty array on error
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [fetchProductsByCategory]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        fetchProductsByCategory(category, 0);
    };

    const handlePageChange = (direction) => {
        if (loadingProducts) return;
        const nextPage = categoryPage + direction;
        if (nextPage < 0 || nextPage >= categoryPagination.totalPages) return;
        fetchProductsByCategory(selectedCategory, nextPage);
    };

    const renderCategoryGrid = () => {
        if (loadingCategories) {
            return <div className="text-center py-6 text-gray-500">Đang tải danh mục...</div>;
        }

        if (categoryError) {
            return <div className="text-center py-6 text-red-500">{categoryError}</div>;
        }

        if (!categories.length) {
            return (
                <div className="text-center py-6 text-gray-500">
                    Chưa có danh mục nào trong hệ thống. Hãy thêm dữ liệu vào MongoDB.
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => {
                    const active = isSameCategory(selectedCategory, category);
                    const categoryId = category.id || category._id || category.slug || category.name;
                    const IconComponent = resolveCategoryIcon(category);

                    return (
                        <button
                            type="button"
                            key={categoryId}
                            onClick={() => handleCategoryClick(category)}
                            className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none ${active ? 'ring-2 ring-primary shadow-xl bg-green-50' : 'bg-white'
                                }`}
                        >
                            <div className={`p-3 rounded-full mb-3 ${active ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                <IconComponent size={40} />
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-semibold ${active ? 'text-green-800' : 'text-gray-800'}`}>{category.name}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderProducts = () => {
        if (!selectedCategory) {
            return <div className="text-gray-500">Hãy chọn một danh mục để xem sản phẩm.</div>;
        }

        if (loadingProducts) {
            return <div className="text-gray-500">Đang tải sản phẩm cho {selectedCategory.name}...</div>;
        }

        if (productError) {
            return <div className="text-red-500">{productError}</div>;
        }

        if (!categoryProducts.length) {
            return <div className="text-gray-500">Chưa có sản phẩm nào thuộc danh mục này.</div>;
        }

        return (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryProducts.map((product) => {
                        const productId = product.id || product._id;
                        return <ProductCard key={productId} product={product} />;
                    })}
                </div>

                {categoryPagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 text-sm text-gray-600">
                        <p>
                            Trang {categoryPage + 1} / {categoryPagination.totalPages} &middot; Hiển thị{' '}
                            {categoryProducts.length} / {categoryPagination.totalElements} sản phẩm
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handlePageChange(-1)}
                                disabled={categoryPage === 0 || loadingProducts}
                                className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePageChange(1)}
                                disabled={categoryPage >= categoryPagination.totalPages - 1 || loadingProducts}
                                className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="mt-8 mb-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Danh mục Truy cập Nhanh</h2>
                </div>
                {selectedCategory && (
                    <Link
                        to={`/search?category=${encodeURIComponent(selectedCategory.name)}`}
                        className="text-sm text-primary hover:underline"
                    >
                        Xem tất cả sản phẩm thuộc {selectedCategory.name}
                    </Link>
                )}
            </div>

            {renderCategoryGrid()}

            <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">
                    {selectedCategory ? `Sản phẩm nổi bật: ${selectedCategory.name}` : 'Chọn danh mục'}
                </h3>
                {renderProducts()}
            </div>
        </div>
    );
}

export default QuickAccessCategories;