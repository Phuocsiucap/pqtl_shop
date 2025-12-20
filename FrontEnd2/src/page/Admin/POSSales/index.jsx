import React, { useState, useEffect, useRef } from "react";
import {
    FaShoppingCart,
    FaSearch,
    FaPlus,
    FaMinus,
    FaTrash,
    FaCreditCard,
    FaMoneyBillWave,
    FaMobileAlt,
    FaUser,
    FaPhone,
    FaReceipt,
    FaCheck,
    FaTimes,
    FaBarcode,
    FaQrcode,
    FaSpinner
} from "react-icons/fa";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import {
    searchProductsForPOS,
    createPOSOrder,
    getCurrentShift,
    getPOSOrdersByShift
} from "../../../api/shift";
import { getFullImageUrl, request1 } from "../../../utils/request";

const POSSales = () => {
    // States
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentShift, setCurrentShift] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);

    // Customer info
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    // Payment
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [amountReceived, setAmountReceived] = useState("");
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState("");

    // Modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [isProcessingVNPay, setIsProcessingVNPay] = useState(false);
    const [vnpayQRUrl, setVnpayQRUrl] = useState(null);
    const [showVNPayModal, setShowVNPayModal] = useState(false);

    const searchInputRef = useRef(null);
    const access_token = getCSRFTokenFromCookie("access_token_admin");

    // Mock employee data
    const employeeId = "EMP001";
    const employeeName = "Nhân viên Demo";

    useEffect(() => {
        checkShift();
        fetchProducts();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

    const checkShift = async () => {
        try {
            const shift = await getCurrentShift(employeeId, access_token);
            setCurrentShift(shift);

            // Lấy đơn hàng gần đây của ca
            const orders = await getPOSOrdersByShift(shift.id, access_token);
            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            setCurrentShift(null);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await searchProductsForPOS(searchKeyword, access_token);
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productId === product.id);

        if (existingItem) {
            if (existingItem.quantity >= product.stockQuantity) {
                alert("Số lượng trong kho không đủ!");
                return;
            }
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
                    : item
            ));
        } else {
            if (product.stockQuantity < 1) {
                alert("Sản phẩm đã hết hàng!");
                return;
            }
            setCart([...cart, {
                productId: product.id,
                productName: product.name,
                productImage: product.image,
                unitPrice: product.finalPrice,
                costPrice: product.costPrice || 0,
                quantity: 1,
                discount: 0,
                totalPrice: product.finalPrice,
                stockQuantity: product.stockQuantity
            }]);
        }
    };

    const updateCartItemQuantity = (productId, newQuantity) => {
        const item = cart.find(i => i.productId === productId);

        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (newQuantity > item.stockQuantity) {
            alert("Số lượng vượt quá tồn kho!");
            return;
        }

        setCart(cart.map(item =>
            item.productId === productId
                ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const clearCart = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
            setCart([]);
            setDiscount(0);
            setNotes("");
        }
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - discount;
    };

    const calculateChange = () => {
        const received = parseFloat(amountReceived) || 0;
        return received - calculateTotal();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount || 0);
    };

    const handlePayment = async () => {
        if (!currentShift) {
            alert("Vui lòng mở ca trước khi bán hàng!");
            return;
        }

        if (cart.length === 0) {
            alert("Giỏ hàng trống!");
            return;
        }

        if (paymentMethod === "CASH") {
            const received = parseFloat(amountReceived) || 0;
            if (received < calculateTotal()) {
                alert("Số tiền khách đưa không đủ!");
                return;
            }
        }

        // Xử lý thanh toán VNPAY
        if (paymentMethod === "VNPAY") {
            await handleVNPayPayment();
            return;
        }

        await processOrder();
    };

    // Xử lý thanh toán VNPAY
    const handleVNPayPayment = async () => {
        setIsProcessingVNPay(true);
        try {
            const orderId = `POS${Date.now()}`;
            const response = await request1.post(
                "/vn/payment",
                {
                    order_id: orderId,
                    amount: Math.round(calculateTotal()),
                    order_desc: `POS - ${customerName || 'Khách vãng lai'} - ${cart.length} sản phẩm`,
                    bank_code: "",
                    language: "vn",
                },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.code === "00" && response.data.payment_url) {
                // Lưu thông tin đơn hàng tạm để xử lý sau khi thanh toán thành công
                localStorage.setItem("pendingPOSOrder", JSON.stringify({
                    orderId,
                    employeeId,
                    employeeName,
                    customerName: customerName || "Khách vãng lai",
                    customerPhone,
                    items: cart.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        discount: item.discount
                    })),
                    discount,
                    paymentMethod: "VNPAY",
                    notes,
                    shiftId: currentShift.id
                }));

                // Mở cửa sổ thanh toán VNPAY trong popup hoặc redirect
                setVnpayQRUrl(response.data.payment_url);
                setShowVNPayModal(true);
                setShowPaymentModal(false);
            } else {
                alert(response.data.message || "Không thể tạo thanh toán VNPAY");
            }
        } catch (error) {
            console.error("VNPAY Error:", error);
            alert("Có lỗi xảy ra khi kết nối VNPAY");
        } finally {
            setIsProcessingVNPay(false);
        }
    };

    // Xử lý hoàn thành đơn hàng (sau khi thanh toán thành công)
    const processOrder = async (overridePaymentMethod = null) => {
        try {
            const currentMethod = overridePaymentMethod || paymentMethod;

            // Nếu là VNPAY và gọi từ polling (đã thanh toán thành công), không cần kiểm tra lại
            // Nếu gọi thủ công, và là tiền mặt, cần kiểm tra đủ tiền
            if (currentMethod === "CASH") {
                const received = parseFloat(amountReceived) || 0;
                if (received < calculateTotal()) {
                    alert("Số tiền khách đưa không đủ!");
                    return;
                }
            }

            const orderData = {
                employeeId,
                employeeName,
                customerName: customerName || "Khách vãng lai",
                customerPhone,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    discount: item.discount
                })),
                discount,
                paymentMethod: currentMethod,
                amountReceived: parseFloat(amountReceived) || calculateTotal(),
                notes
            };

            const order = await createPOSOrder(orderData, access_token);
            setLastOrder(order);
            setShowPaymentModal(false);
            setShowVNPayModal(false);
            setShowSuccessModal(true);
            setVnpayQRUrl(null); // Clear QR URL to stop polling

            // Reset form
            resetForm();
            checkShift();

        } catch (error) {
            console.error("Error creating order:", error);
            alert(error.response?.data?.error || "Có lỗi xảy ra khi tạo đơn hàng!");
        }
    };

    const resetForm = () => {
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setPaymentMethod("CASH");
        setAmountReceived("");
        setDiscount(0);
        setNotes("");
        setVnpayQRUrl(null);
        localStorage.removeItem("pendingPOSOrder");
    };

    // Polling kiểm tra trạng thái thanh toán VNPAY
    useEffect(() => {
        let pollingInterval;

        if (showVNPayModal && vnpayQRUrl) {
            const pendingOrderStr = localStorage.getItem("pendingPOSOrder");
            if (pendingOrderStr) {
                const pendingOrder = JSON.parse(pendingOrderStr);
                const orderId = pendingOrder.orderId;

                // Hàm kiểm tra trạng thái
                const checkStatus = async () => {
                    try {
                        const response = await request1.get(`/vn/transaction/${orderId}`, {
                            headers: { Authorization: `Bearer ${access_token}` }
                        });

                        if (response.data && response.data.transactionStatus === "SUCCESS") {
                            // Thanh toán thành công!
                            clearInterval(pollingInterval);
                            setShowVNPayModal(false);
                            setVnpayQRUrl(null);

                            // Gọi tạo đơn hàng
                            await processOrder("VNPAY");
                        }
                    } catch (error) {
                        // Bỏ qua lỗi 404 nếu chưa có transaction hoặc lỗi mạng tạm thời
                        console.log("Checking payment status...", error);
                    }
                };

                // Polling mỗi 2 giây
                pollingInterval = setInterval(checkStatus, 2000);
            }
        }

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [showVNPayModal, vnpayQRUrl]);

    // Kiểm tra kết quả thanh toán VNPAY (khi user quay lại từ VNPAY)
    useEffect(() => {
        const checkVNPayResult = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');

            if (vnp_ResponseCode) {
                const pendingOrder = JSON.parse(localStorage.getItem("pendingPOSOrder") || "null");

                if (vnp_ResponseCode === "00" && pendingOrder) {
                    // Thanh toán thành công, tạo đơn hàng
                    try {
                        const order = await createPOSOrder({
                            ...pendingOrder,
                            amountReceived: pendingOrder.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                        }, access_token);

                        setLastOrder(order);
                        setShowSuccessModal(true);
                        localStorage.removeItem("pendingPOSOrder");
                    } catch (error) {
                        console.error("Error creating order after VNPAY:", error);
                    }
                } else if (pendingOrder) {
                    alert("Thanh toán VNPAY không thành công. Vui lòng thử lại.");
                    localStorage.removeItem("pendingPOSOrder");
                }

                // Clear URL params
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        };

        checkVNPayResult();
    }, []);

    const quickCashAmounts = [50000, 100000, 200000, 500000, 1000000];

    // Nếu chưa mở ca, hiển thị thông báo
    if (!currentShift) {
        return (
            <div className="p-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                    <div className="flex items-center">
                        <FaReceipt className="text-yellow-400 text-3xl mr-4" />
                        <div>
                            <h2 className="text-xl font-bold text-yellow-700">Chưa mở ca làm việc</h2>
                            <p className="text-yellow-600 mt-1">
                                Vui lòng mở ca tại trang "Bàn giao Ca" trước khi bán hàng.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] flex">
            {/* Left Panel - Products */}
            <div className="flex-1 flex flex-col bg-gray-100 p-4 overflow-hidden">
                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm kiếm sản phẩm (tên, mã, danh mục)..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <FaBarcode className="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-blue-500" />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            Không tìm thấy sản phẩm
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={`bg-white rounded-lg shadow p-3 cursor-pointer hover:shadow-lg transition ${product.stockQuantity < 1 ? 'opacity-50' : ''
                                        }`}
                                >
                                    <img
                                        src={getFullImageUrl(product.image)}
                                        alt={product.name}
                                        className="w-full h-24 object-cover rounded mb-2"
                                    />
                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10">
                                        {product.name}
                                    </h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm font-bold text-blue-600">
                                            {formatCurrency(product.finalPrice)}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded ${product.stockQuantity > 10
                                                ? 'bg-green-100 text-green-700'
                                                : product.stockQuantity > 0
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                            {product.stockQuantity > 0 ? `SL: ${product.stockQuantity}` : 'Hết hàng'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Cart */}
            <div className="w-96 bg-white shadow-lg flex flex-col">
                {/* Cart Header */}
                <div className="p-4 border-b bg-blue-500 text-white">
                    <h2 className="text-xl font-bold flex items-center">
                        <FaShoppingCart className="mr-2" />
                        Giỏ hàng
                        {cart.length > 0 && (
                            <span className="ml-2 bg-white text-blue-500 px-2 py-1 rounded-full text-sm">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        )}
                    </h2>
                </div>

                {/* Customer Info */}
                <div className="p-3 border-b bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <FaUser className="absolute left-2 top-2.5 text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Tên khách hàng"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full pl-7 pr-2 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <FaPhone className="absolute left-2 top-2.5 text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full pl-7 pr-2 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            <FaShoppingCart className="text-4xl mx-auto mb-2" />
                            <p>Giỏ hàng trống</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                                                {item.productName}
                                            </h4>
                                            <p className="text-sm text-blue-600 font-medium">
                                                {formatCurrency(item.unitPrice)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                                                className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                            >
                                                <FaMinus className="text-xs" />
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                                                className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                                            >
                                                <FaPlus className="text-xs" />
                                            </button>
                                        </div>
                                        <p className="font-bold text-gray-800">
                                            {formatCurrency(item.totalPrice)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Footer */}
                <div className="border-t p-4 bg-gray-50">
                    {/* Discount */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Giảm giá:</span>
                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="w-24 p-1 text-right border rounded"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex items-center justify-between mb-4 text-lg">
                        <span className="font-bold">Tổng cộng:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={clearCart}
                            disabled={cart.length === 0}
                            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                        >
                            Xóa giỏ
                        </button>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={cart.length === 0}
                            className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center"
                        >
                            <FaCreditCard className="mr-2" />
                            Thanh toán
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-bold">Thanh toán</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <div className="p-4">
                            {/* Payment Method */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phương thức thanh toán
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod("CASH")}
                                        className={`p-3 rounded-lg border-2 flex flex-col items-center ${paymentMethod === "CASH"
                                                ? "border-green-500 bg-green-50"
                                                : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <FaMoneyBillWave className={`text-2xl ${paymentMethod === "CASH" ? "text-green-500" : "text-gray-400"}`} />
                                        <span className="text-xs mt-1">Tiền mặt</span>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod("VNPAY")}
                                        className={`p-3 rounded-lg border-2 flex flex-col items-center ${paymentMethod === "VNPAY"
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <FaQrcode className={`text-2xl ${paymentMethod === "VNPAY" ? "text-red-500" : "text-gray-400"}`} />
                                        <span className="text-xs mt-1">VNPAY</span>
                                    </button>

                                </div>
                            </div>

                            {/* Amount */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex justify-between text-lg mb-2">
                                    <span>Tổng tiền:</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                                </div>

                                {paymentMethod === "CASH" && (
                                    <>
                                        <div className="mb-2">
                                            <label className="block text-sm text-gray-600 mb-1">Tiền khách đưa:</label>
                                            <input
                                                type="number"
                                                value={amountReceived}
                                                onChange={(e) => setAmountReceived(e.target.value)}
                                                className="w-full p-2 border rounded-lg text-right text-lg font-medium"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {quickCashAmounts.map((amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setAmountReceived(amount.toString())}
                                                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                                                >
                                                    {formatCurrency(amount)}
                                                </button>
                                            ))}
                                        </div>
                                        <div className={`flex justify-between text-lg ${calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            <span>Tiền thối:</span>
                                            <span className="font-bold">{formatCurrency(calculateChange())}</span>
                                        </div>
                                    </>
                                )}

                                {paymentMethod === "VNPAY" && (
                                    <div className="text-center py-4">
                                        <FaQrcode className="text-5xl text-red-500 mx-auto mb-2" />
                                        <p className="text-gray-600 text-sm">
                                            Nhấn "Thanh toán VNPAY" để tạo mã QR thanh toán
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Hỗ trợ: Thẻ ATM, Visa, MasterCard, JCB, QR Pay
                                        </p>
                                    </div>
                                )}




                            </div>

                            {/* Notes */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-2 border rounded-lg"
                                    rows="2"
                                    placeholder="Ghi chú (nếu có)..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 p-4 border-t">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={isProcessingVNPay}
                                className={`px-6 py-2 rounded-lg flex items-center ${paymentMethod === "VNPAY"
                                        ? "bg-red-500 hover:bg-red-600 text-white"
                                        : "bg-green-500 hover:bg-green-600 text-white"
                                    } disabled:opacity-50`}
                            >
                                {isProcessingVNPay ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Đang xử lý...
                                    </>
                                ) : paymentMethod === "VNPAY" ? (
                                    <>
                                        <FaQrcode className="mr-2" />
                                        Thanh toán VNPAY
                                    </>
                                ) : (
                                    <>
                                        <FaCheck className="mr-2" />
                                        Xác nhận thanh toán
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VNPAY Payment Modal */}
            {showVNPayModal && vnpayQRUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full">
                        <div className="flex justify-between items-center p-4 border-b bg-red-500 text-white rounded-t-lg">
                            <h2 className="text-xl font-bold flex items-center">
                                <FaQrcode className="mr-2" />
                                Thanh toán VNPAY
                            </h2>
                            <button
                                onClick={() => {
                                    setShowVNPayModal(false);
                                    setVnpayQRUrl(null);
                                }}
                                className="text-white hover:text-gray-200"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 text-center">
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-lg font-bold text-gray-800 mb-2">
                                    Tổng thanh toán: {formatCurrency(calculateTotal())}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Khách hàng: {customerName || "Khách vãng lai"}
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-600 mb-3">
                                    Chọn cách thanh toán:
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href={vnpayQRUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 border-2 border-red-500 rounded-lg hover:bg-red-50 transition flex flex-col items-center"
                                    >
                                        <FaQrcode className="text-3xl text-red-500 mb-2" />
                                        <span className="font-medium">Mở trang VNPAY</span>
                                        <span className="text-xs text-gray-500">Quét QR hoặc nhập thẻ</span>
                                    </a>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(vnpayQRUrl);
                                            alert("Đã copy link thanh toán!");
                                        }}
                                        className="p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition flex flex-col items-center"
                                    >
                                        <FaCreditCard className="text-3xl text-gray-500 mb-2" />
                                        <span className="font-medium">Copy link</span>
                                        <span className="text-xs text-gray-500">Gửi cho khách hàng</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
                                <p className="text-sm text-yellow-700">
                                    <strong>Lưu ý:</strong> Sau khi khách hàng thanh toán thành công,
                                    hãy nhấn "Xác nhận đã thanh toán" để hoàn tất đơn hàng.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between p-4 border-t bg-gray-50 rounded-b-lg">
                            <button
                                onClick={() => {
                                    setShowVNPayModal(false);
                                    setVnpayQRUrl(null);
                                    localStorage.removeItem("pendingPOSOrder");
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Hủy thanh toán
                            </button>
                            <button
                                onClick={() => processOrder("VNPAY")}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                            >
                                <FaCheck className="mr-2" />
                                Xác nhận đã thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && lastOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full text-center p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCheck className="text-3xl text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-600 mb-4">Mã đơn hàng: <span className="font-bold">{lastOrder.posOrderCode}</span></p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span>Tổng tiền:</span>
                                <span className="font-bold">{formatCurrency(lastOrder.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Phương thức:</span>
                                <span className="font-medium">
                                    {lastOrder.paymentMethod === "CASH" ? "Tiền mặt" :
                                        lastOrder.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : "Ví điện tử"}
                                </span>
                            </div>
                            {lastOrder.paymentMethod === "CASH" && (
                                <>
                                    <div className="flex justify-between mb-2">
                                        <span>Tiền nhận:</span>
                                        <span>{formatCurrency(lastOrder.amountReceived)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tiền thối:</span>
                                        <span className="font-bold text-green-600">{formatCurrency(lastOrder.changeAmount)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                setLastOrder(null);
                                searchInputRef.current?.focus();
                            }}
                            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Đơn hàng mới
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSSales;
