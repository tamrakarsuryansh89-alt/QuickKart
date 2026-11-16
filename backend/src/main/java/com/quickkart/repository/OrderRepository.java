
package com.quickkart.repository;

import com.quickkart.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderRepository extends MongoRepository<Order, String> {

    // Customer: Fetch only their own orders
    List<Order> findByUserId(String userId);

    Optional<Order> findByIdAndUserId(String id, String userId);

    // Admin: Fetch orders by status
    List<Order> findByStatus(String status);

    // Admin: Search orders by customer name with pagination
    Page<Order> findByCustomerContainingIgnoreCase(String customer, Pageable pageable);
}
