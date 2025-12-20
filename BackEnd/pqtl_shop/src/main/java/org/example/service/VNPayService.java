package org.example.service;

import jakarta.servlet.http.HttpServletRequest;
import org.example.config.VNPayConfig;
import org.example.dto.VNPayRequestDTO;
import org.example.dto.VNPayResponseDTO;
import org.example.model.PaymentTransaction;
import org.example.repository.PaymentTransactionRepository;
import org.example.repository.order.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class VNPayService {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Tạo URL thanh toán VNPAY
     */
    public VNPayResponseDTO createPaymentUrl(VNPayRequestDTO request, HttpServletRequest httpRequest, String userId) {
        try {
            // Lấy thời gian hiện tại
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());

            // Thời gian hết hạn (15 phút)
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());

            // Mã giao dịch duy nhất
            String vnp_TxnRef = request.getOrder_id() + "_" + vnPayConfig.getRandomNumber(8);

            // Số tiền (VNPAY yêu cầu x100)
            long amount = request.getAmount() * 100;

            // Tạo map tham số
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");
            
            if (request.getBank_code() != null && !request.getBank_code().isEmpty()) {
                vnp_Params.put("vnp_BankCode", request.getBank_code());
            }
            
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", request.getOrder_desc());
            vnp_Params.put("vnp_OrderType", "billpayment");
            
            String language = request.getLanguage();
            vnp_Params.put("vnp_Locale", (language != null && !language.isEmpty()) ? language : "vn");
            
            vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
            vnp_Params.put("vnp_IpAddr", vnPayConfig.getIpAddress(httpRequest));
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Sắp xếp và tạo query string
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            // Tạo secure hash
            String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
            query.append("&vnp_SecureHash=").append(vnp_SecureHash);

            String paymentUrl = vnPayConfig.getVnpPayUrl() + "?" + query;

            // Lưu transaction vào database
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setOrderId(request.getOrder_id());
            transaction.setVnpTxnRef(vnp_TxnRef);
            transaction.setAmount(request.getAmount());
            transaction.setOrderInfo(request.getOrder_desc());
            transaction.setBankCode(request.getBank_code());
            transaction.setTransactionStatus("PENDING");
            transaction.setUserId(userId);
            transaction.setCreatedAt(LocalDateTime.now());
            paymentTransactionRepository.save(transaction);

            return VNPayResponseDTO.builder()
                    .code("00")
                    .message("Tạo URL thanh toán thành công")
                    .payment_url(paymentUrl)
                    .order_id(request.getOrder_id())
                    .amount(request.getAmount())
                    .order_desc(request.getOrder_desc())
                    .build();

        } catch (Exception e) {
            return VNPayResponseDTO.builder()
                    .code("99")
                    .message("Lỗi tạo URL thanh toán: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Xử lý callback từ VNPAY
     */
    public VNPayResponseDTO processPaymentReturn(HttpServletRequest request) {
        try {
            Map<String, String> fields = new HashMap<>();
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            fields.remove("vnp_SecureHashType");
            fields.remove("vnp_SecureHash");

            // Verify checksum
            String signValue = vnPayConfig.hashAllFields(fields);
            
            System.out.println("=== VNPAY VERIFICATION DEBUG ===");
            System.out.println("vnp_SecureHash (Received): " + vnp_SecureHash);
            System.out.println("signValue (Calculated): " + signValue);
            
            String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
            String vnp_TxnRef = request.getParameter("vnp_TxnRef");
            String vnp_Amount = request.getParameter("vnp_Amount");
            String vnp_OrderInfo = request.getParameter("vnp_OrderInfo");
            String vnp_TransactionNo = request.getParameter("vnp_TransactionNo");
            String vnp_BankCode = request.getParameter("vnp_BankCode");
            String vnp_PayDate = request.getParameter("vnp_PayDate");
            String vnp_CardType = request.getParameter("vnp_CardType");
            String vnp_TransactionStatus = request.getParameter("vnp_TransactionStatus");

            // Lấy order_id từ vnp_TxnRef (format: orderId_randomNumber)
            String orderId = vnp_TxnRef.contains("_") ? vnp_TxnRef.substring(0, vnp_TxnRef.lastIndexOf("_")) : vnp_TxnRef;

            VNPayResponseDTO response = VNPayResponseDTO.builder()
                    .order_id(orderId)
                    .amount(Long.parseLong(vnp_Amount) / 100)
                    .order_desc(vnp_OrderInfo)
                    .transaction_no(vnp_TransactionNo)
                    .bank_code(vnp_BankCode)
                    .pay_date(formatPayDate(vnp_PayDate))
                    .card_type(vnp_CardType)
                    .response_code(vnp_ResponseCode)
                    .build();

            if (signValue.equals(vnp_SecureHash)) {
                if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
                    // Thanh toán thành công
                    response.setCode("00");
                    response.setMessage("Thanh toán thành công");
                    
                    // Cập nhật transaction và order
                    updatePaymentSuccess(vnp_TxnRef, vnp_TransactionNo, vnp_BankCode, vnp_PayDate, vnp_CardType, orderId);
                    System.out.println("Status: Success. Order updated.");
                } else {
                    // Thanh toán thất bại
                    response.setCode(vnp_ResponseCode);
                    response.setMessage(getVNPayResponseMessage(vnp_ResponseCode));
                    
                    // Cập nhật transaction status
                    updatePaymentFailed(vnp_TxnRef, vnp_ResponseCode);
                    System.out.println("Status: Failed via ResponseCode.");
                }
            } else {
                response.setCode("97");
                response.setMessage("Chữ ký không hợp lệ");
                System.out.println("Status: Signature Mismatch!");
            }

            return response;

        } catch (Exception e) {
            return VNPayResponseDTO.builder()
                    .code("99")
                    .message("Lỗi xử lý thanh toán: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Cập nhật khi thanh toán thành công
     */
    private void updatePaymentSuccess(String vnpTxnRef, String transactionNo, String bankCode, 
                                       String payDate, String cardType, String orderId) {
        // Cập nhật PaymentTransaction
        paymentTransactionRepository.findByVnpTxnRef(vnpTxnRef).ifPresent(transaction -> {
            transaction.setVnpTransactionNo(transactionNo);
            transaction.setBankCode(bankCode);
            transaction.setPayDate(payDate);
            transaction.setCardType(cardType);
            transaction.setTransactionStatus("SUCCESS");
            transaction.setUpdatedAt(LocalDateTime.now());
            paymentTransactionRepository.save(transaction);
        });

        // Cập nhật Order
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setPaymentStatus("Đã thanh toán");
            order.setPaymentMethod("VNPAY");
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        });
    }

    /**
     * Cập nhật khi thanh toán thất bại
     */
    private void updatePaymentFailed(String vnpTxnRef, String responseCode) {
        paymentTransactionRepository.findByVnpTxnRef(vnpTxnRef).ifPresent(transaction -> {
            transaction.setTransactionStatus("FAILED");
            transaction.setResponseCode(responseCode);
            transaction.setUpdatedAt(LocalDateTime.now());
            paymentTransactionRepository.save(transaction);
        });
    }

    /**
     * Format ngày thanh toán
     */
    private String formatPayDate(String vnpPayDate) {
        if (vnpPayDate == null || vnpPayDate.length() < 14) {
            return vnpPayDate;
        }
        try {
            // Format: yyyyMMddHHmmss -> dd/MM/yyyy HH:mm:ss
            String year = vnpPayDate.substring(0, 4);
            String month = vnpPayDate.substring(4, 6);
            String day = vnpPayDate.substring(6, 8);
            String hour = vnpPayDate.substring(8, 10);
            String minute = vnpPayDate.substring(10, 12);
            String second = vnpPayDate.substring(12, 14);
            return day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second;
        } catch (Exception e) {
            return vnpPayDate;
        }
    }

    /**
     * Lấy message từ response code VNPAY
     */
    public String getVNPayResponseMessage(String responseCode) {
        return switch (responseCode) {
            case "00" -> "Giao dịch thành công";
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)";
            case "09" -> "Giao dịch không thành công: Thẻ/Tài khoản chưa đăng ký Internet Banking";
            case "10" -> "Giao dịch không thành công: Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
            case "11" -> "Giao dịch không thành công: Đã hết hạn chờ thanh toán";
            case "12" -> "Giao dịch không thành công: Thẻ/Tài khoản bị khóa";
            case "13" -> "Giao dịch không thành công: Mật khẩu xác thực OTP không đúng";
            case "24" -> "Giao dịch không thành công: Khách hàng hủy giao dịch";
            case "51" -> "Giao dịch không thành công: Tài khoản không đủ số dư";
            case "65" -> "Giao dịch không thành công: Tài khoản đã vượt quá hạn mức giao dịch trong ngày";
            case "75" -> "Ngân hàng thanh toán đang bảo trì";
            case "79" -> "Giao dịch không thành công: Nhập sai mật khẩu quá số lần quy định";
            default -> "Giao dịch không thành công. Mã lỗi: " + responseCode;
        };
    }

    /**
     * Lấy lịch sử giao dịch của user
     */
    public List<PaymentTransaction> getUserTransactions(String userId) {
        return paymentTransactionRepository.findByUserId(userId);
    }

    /**
     * Lấy transaction theo order ID
     */
    public Optional<PaymentTransaction> getTransactionByOrderId(String orderId) {
        return paymentTransactionRepository.findByOrderId(orderId);
    }

    /**
     * Lấy tất cả giao dịch (cho admin)
     */
    public List<PaymentTransaction> getAllTransactions() {
        return paymentTransactionRepository.findAll();
    }

    /**
     * Thống kê giao dịch
     */
    public Map<String, Object> getTransactionStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", paymentTransactionRepository.count());
        stats.put("success", paymentTransactionRepository.countByTransactionStatus("SUCCESS"));
        stats.put("failed", paymentTransactionRepository.countByTransactionStatus("FAILED"));
        stats.put("pending", paymentTransactionRepository.countByTransactionStatus("PENDING"));
        return stats;
    }
}
