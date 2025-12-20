import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import ProductCard from '../components/Product/ProductCard'; 
import { request1 } from '../utils/request';

const PAGE_SIZE = 8;
const MAX_PAGE_BUTTONS = 5;

const SORT_OPTIONS = [
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_low_to_high', label: 'Giá: Thấp đến Cao' },
    { value: 'price_high_to_low', label: 'Giá: Cao đến Thấp' },
];

const INITIAL_FILTERS = {
    categories: [],
    onSaleOnly: false,
    isSeasonal: false,
    isClearance: false,
};

const normalizeFilterMeta = (payload) => {
    const listToMap = (list = []) =>
        list.reduce((acc, item) => {
            if (item?.value) {
                acc[item.value] = item.count || 0;
            }
            return acc;
        }, {});

    return {
        categories: listToMap(payload?.categories),
        priceRange: {
            min: Number.isFinite(payload?.minPrice) ? payload.minPrice : 0,
            max: Number.isFinite(payload?.maxPrice) ? payload.maxPrice : 0,
        },
        onSaleCount: payload?.onSaleCount || 0,
        seasonalCount: payload?.seasonalCount || 0,
        clearanceCount: payload?.clearanceCount || 0,
    };
};

const INITIAL_FILTER_META = normalizeFilterMeta(null);

const normalizeSlug = (value = '') =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

const SearchProductItem = ({ product }) => {
    const navigate = useNavigate();
    const productId = product.id || product._id;

    const handleClick = () => {
        if (productId) {
            navigate(`/products/${productId}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="h-full flex flex-col cursor-pointer transition-transform hover:scale-105"
        >
            <div className="flex-1">
                <ProductCard product={{ ...product, id: productId }} />
            </div>
        </div>
    );
};

function SearchResultPage() {
    const location = useLocation();
    const params = useParams();
    const { search, products, loading, error, categories } = useSearch();
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [sortBy, setSortBy] = useState('popular');
    const [page, setPage] = useState(0);
    const [filterMeta, setFilterMeta] = useState(INITIAL_FILTER_META);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filterLoading, setFilterLoading] = useState(false);
    const [metaError, setMetaError] = useState(null);
    const initialCategoryRef = useRef(null);

    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const keyword = queryParams.get('keyword') || '';
    const categoryFromQuery = queryParams.get('category');

    const categoryFromSlug = useMemo(() => {
        if (!params?.slug) return null;
        const targetSlug = params.slug.toLowerCase();
        const matched = categories.find((cat) => {
            const slug = (cat.slug || normalizeSlug(cat.name || '')).toLowerCase();
            return slug === targetSlug;
        });
        return matched?.name || null;
    }, [params?.slug, categories]);

    const activeCategoryFromUrl = categoryFromQuery || categoryFromSlug;

    useEffect(() => {
        if (!activeCategoryFromUrl) return;
        if (initialCategoryRef.current === activeCategoryFromUrl) return;
        initialCategoryRef.current = activeCategoryFromUrl;
        setFilters((prev) => {
            if (prev.categories.includes(activeCategoryFromUrl)) {
                return prev;
            }
            return {
                ...prev,
                categories: [...prev.categories, activeCategoryFromUrl],
            };
        });
    }, [activeCategoryFromUrl]);

    const effectiveCategories = useMemo(() => {
        if (!categories || categories.length === 0) {
            return [];
        }
        return categories.map((cat) => ({
            name: cat.name,
        }));
    }, [categories]);

    const queryPayload = useMemo(() => {
        const payload = {
            page,
            size: PAGE_SIZE,
            sortBy,
        };

        if (keyword) payload.keyword = keyword;
        if (filters.categories.length) payload.categoriesCsv = filters.categories.join(',');
        if (filters.onSaleOnly) payload.onSaleOnly = true;
        if (filters.isSeasonal) payload.isSeasonal = true;
        if (filters.isClearance) payload.isClearance = true;

        return payload;
    }, [filters, sortBy, page, keyword]);

    const [debouncedParams, setDebouncedParams] = useState(queryPayload);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedParams(queryPayload);
        }, 350);
        return () => clearTimeout(handler);
    }, [queryPayload]);

    const fetchFilterMetadata = useCallback(async (paramsPayload) => {
        setFilterLoading(true);
        setMetaError(null);
        try {
            const { data } = await request1.get('v1/search/filters', {
                params: { ...paramsPayload, page: 0 },
            });
            setFilterMeta(normalizeFilterMeta(data));
        } catch (err) {
            console.error('Failed to fetch filter metadata', err);
            setMetaError('Không thể tải bộ lọc. Vui lòng thử lại sau.');
        } finally {
            setFilterLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!debouncedParams) return;
        search(debouncedParams);
        fetchFilterMetadata(debouncedParams);
    }, [debouncedParams, search, fetchFilterMetadata]);

    const totalPages = products?.totalPages || 1;

    const handleStepPageChange = (direction) => {
        const nextPage = page + direction;
        if (nextPage < 0 || nextPage >= totalPages || nextPage === page) return;
        setPage(nextPage);
    };

    const handleDirectPageChange = (targetPage) => {
        if (targetPage === page || targetPage < 0 || targetPage >= totalPages) return;
        setPage(targetPage);
    };

    const buildPageRange = () => {
        const pages = [];
        const half = Math.floor(MAX_PAGE_BUTTONS / 2);
        let start = Math.max(0, page - half);
        let end = start + MAX_PAGE_BUTTONS - 1;

        if (end >= totalPages - 1) {
            end = totalPages - 1;
            start = Math.max(0, end - MAX_PAGE_BUTTONS + 1);
        }

        for (let i = start; i <= end; i += 1) {
            pages.push(i);
        }

        return pages;
    };

    const pageRange = buildPageRange();
    const getCount = (map, key) => (map && key ? map[key] || 0 : 0);

    const applyFilterUpdate = useCallback((updater) => {
        setFilters((prev) => updater(prev));
        setPage(0);
    }, []);

    const handleCategoryToggle = (name) => {
        applyFilterUpdate((prev) => {
            const exists = prev.categories.includes(name);
            const nextCategories = exists
                ? prev.categories.filter((item) => item !== name)
                : [...prev.categories, name];
            return { ...prev, categories: nextCategories };
        });
    };

    const handleSaleToggle = () => {
        applyFilterUpdate((prev) => ({
            ...prev,
            onSaleOnly: !prev.onSaleOnly,
        }));
    };

    const handleSeasonalToggle = () => {
        applyFilterUpdate((prev) => ({
            ...prev,
            isSeasonal: !prev.isSeasonal,
        }));
    };

    const handleClearanceToggle = () => {
        applyFilterUpdate((prev) => ({
            ...prev,
            isClearance: !prev.isClearance,
        }));
    };

    const clearAllFilters = () => {
        setFilters(INITIAL_FILTERS);
        setPage(0);
    };

    const appliedTags = useMemo(() => {
        const tags = [];

        filters.categories.forEach((value) =>
            tags.push({ key: 'category', value, label: `Danh mục: ${value}` })
        );

        if (filters.onSaleOnly) {
            tags.push({ key: 'sale', value: 'sale', label: 'Đang khuyến mãi' });
        }

        if (filters.isSeasonal) {
            tags.push({ key: 'seasonal', value: 'seasonal', label: 'Sản phẩm theo mùa' });
        }

        if (filters.isClearance) {
            tags.push({ key: 'clearance', value: 'clearance', label: 'Hàng thanh lý' });
        }

        return tags;
    }, [filters]);

    const handleRemoveTag = (tag) => {
        switch (tag.key) {
            case 'category':
                handleCategoryToggle(tag.value);
                break;
            case 'sale':
                handleSaleToggle();
                break;
            case 'seasonal':
                handleSeasonalToggle();
                break;
            case 'clearance':
                handleClearanceToggle();
                break;
            default:
                break;
        }
    };

    const headingParts = [];
    if (keyword) headingParts.push(`"${keyword}"`);
    if (filters.categories.length) headingParts.push(filters.categories.join(', '));
    const headingLabel = headingParts.length ? `Kết quả cho ${headingParts.join(' + ')}` : 'Danh sách sản phẩm';


    const renderFilterSection = (title, children) => (
        <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
            {children}
        </div>
    );

    const renderFilters = () => (
        <div className="flex flex-col gap-5 text-sm">
            {/* Danh mục sản phẩm */}
            {effectiveCategories.length > 0 && renderFilterSection(
                'Danh mục sản phẩm',
                <div className="space-y-3">
                    {effectiveCategories.map(({ name }) => (
                        <div key={name}>
                            <label className="flex items-center gap-2 text-gray-700">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-400"
                                    checked={filters.categories.includes(name)}
                                    onChange={() => handleCategoryToggle(name)}
                                />
                                <span className="flex-1">{name}</span>
                                <span className="text-xs text-gray-500">
                                    ({getCount(filterMeta.categories, name)})
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            )}

            {/* Trạng thái sản phẩm */}
            {renderFilterSection(
                'Trạng thái sản phẩm',
                <div className="space-y-3">
                    <label className="flex items-center justify-between text-gray-700">
                        <div>
                            <p className="font-medium">Đang giảm giá</p>
                            <p className="text-xs text-gray-500">
                                ({filterMeta.onSaleCount} sản phẩm)
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-400"
                            checked={filters.onSaleOnly}
                            onChange={handleSaleToggle}
                        />
                    </label>

                    <label className="flex items-center justify-between text-gray-700">
                        <div>
                            <p className="font-medium">Sản phẩm theo mùa</p>
                            <p className="text-xs text-gray-500">
                                ({filterMeta.seasonalCount} sản phẩm)
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-400"
                            checked={filters.isSeasonal}
                            onChange={handleSeasonalToggle}
                        />
                    </label>

                    <label className="flex items-center justify-between text-gray-700">
                        <div>
                            <p className="font-medium">Hàng thanh lý</p>
                            <p className="text-xs text-gray-500">
                                ({filterMeta.clearanceCount} sản phẩm)
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-400"
                            checked={filters.isClearance}
                            onChange={handleClearanceToggle}
                        />
                    </label>
                </div>
            )}
        </div>
    );

    const renderFilterPanel = () => (
        <div
            className={`fixed top-0 left-0 z-40 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 lg:static lg:h-auto lg:w-80 lg:shadow-none lg:translate-x-0 ${
                filtersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
            <div className="p-5 h-full flex flex-col gap-5 overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Bộ lọc nâng cao</h2>
                    <button
                        className="lg:hidden text-sm text-gray-500"
                        onClick={() => setFiltersOpen(false)}
                    >
                        Đóng
                    </button>
                </div>

                {filterLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Đang cập nhật bộ lọc...
                    </div>
                )}
                {metaError && <p className="text-sm text-red-500">{metaError}</p>}

                {renderFilters()}

                <button
                    type="button"
                    className="w-full text-sm text-primary font-semibold"
                    onClick={clearAllFilters}
                >
                    Xóa tất cả bộ lọc
                </button>

                <button
                    type="button"
                    className="lg:hidden w-full bg-primary text-white py-2 rounded-md font-semibold"
                    onClick={() => setFiltersOpen(false)}
                >
                    Áp dụng
                </button>
            </div>
            </div>
        );

    const renderTagList = () =>
        appliedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
                {appliedTags.map((tag) => (
                    <span
                        key={`${tag.key}-${tag.value}`}
                        className="flex items-center gap-2 bg-white border border-primary/30 text-primary text-xs px-3 py-1 rounded-full"
                    >
                        {tag.label}
                        <button
                            type="button"
                            className="text-primary hover:text-red-500"
                            onClick={() => handleRemoveTag(tag)}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-primary"
                    onClick={clearAllFilters}
                >
                    Xóa tất cả
                </button>
            </div>
        );

    const renderSorting = () => (
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <label htmlFor="search-sort-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                <span className="hidden sm:inline">Sắp xếp theo: </span>
                <span className="sm:hidden">Sắp xếp: </span>
            </label>
            <select
                id="search-sort-select"
                aria-label="Sắp xếp kết quả tìm kiếm"
                value={sortBy}
                onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(0);
                }}
                className="flex-1 border-0 bg-transparent text-sm text-gray-800 font-medium focus:outline-none focus:ring-0 cursor-pointer appearance-none"
            >
                {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <svg 
                className="w-4 h-4 text-gray-500 pointer-events-none" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{headingLabel}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Tìm thấy {products?.totalElements || 0} sản phẩm phù hợp
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="lg:hidden px-4 py-2 border rounded-md text-sm bg-white shadow"
                            onClick={() => setFiltersOpen(true)}
                        >
                            Bộ lọc
                        </button>
                        {renderSorting()}
                    </div>
                </div>

                {renderTagList()}

                <div className="flex flex-col lg:flex-row gap-6">
                    {filtersOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                            onClick={() => setFiltersOpen(false)}
                        />
                    )}

                    {renderFilterPanel()}

                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-lg shadow">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-gray-600">Đang tải sản phẩm...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-white rounded-lg shadow p-8 text-center text-red-500">
                                {error}
                            </div>
                        ) : products?.content?.length ? (
                            <>
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 rounded-lg shadow mb-4">
                <p className="text-sm text-gray-600 mb-2 lg:mb-0">
                                        Hiển thị {products.content.length} / {products.totalElements} kết quả
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            disabled={page === 0}
                                            onClick={() => handleStepPageChange(-1)}
                                            className="px-3 py-1 border rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
                                        >
                                            Trước
                                        </button>
                                        <div className="flex flex-wrap gap-2">
                                            {pageRange.map((pageIndex) => (
                                                <button
                                                    key={pageIndex}
                                                    onClick={() => handleDirectPageChange(pageIndex)}
                                                    className={`px-3 py-1 border rounded ${
                                                        pageIndex === page
                                                            ? 'bg-primary text-white border-primary'
                                                            : 'bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageIndex + 1}
                                                </button>
                                            ))}
                </div>
                                        <button
                                            disabled={page >= totalPages - 1}
                                            onClick={() => handleStepPageChange(1)}
                                            className="px-3 py-1 border rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
                                        >
                                            Sau
                                        </button>
                </div>
            </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
                                    {products.content.map((product) => (
                                        <SearchProductItem key={product.id || product._id} product={product} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-8 text-center">
                                <p className="text-gray-600 mb-3">Không tìm thấy sản phẩm nào phù hợp.</p>
                                <button
                                    type="button"
                                    className="text-primary underline text-sm"
                                    onClick={clearAllFilters}
                                >
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchResultPage;
