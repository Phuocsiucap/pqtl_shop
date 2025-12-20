package org.example.repository;

import org.example.model.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {
    
    Optional<PaymentTransaction> findByVnpTxnRef(String vnpTxnRef);
    
    Optional<PaymentTransaction> findByOrderId(String orderId);
    
    List<PaymentTransaction> findByUserId(String userId);
    
    List<PaymentTransaction> findByTransactionStatus(String status);
    
    List<PaymentTransaction> findByUserIdAndTransactionStatus(String userId, String status);
    
    List<PaymentTransaction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    List<PaymentTransaction> findByTransactionStatusAndCreatedAtBetween(String status, LocalDateTime start, LocalDateTime end);
    
    boolean existsByVnpTxnRef(String vnpTxnRef);
    
    long countByTransactionStatus(String status);
    
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
