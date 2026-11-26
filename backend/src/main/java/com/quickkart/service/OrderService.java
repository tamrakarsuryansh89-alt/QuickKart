
package com.quickkart.service;

import com.quickkart.dto.OrderRequest;
import com.quickkart.dto.OrderItemRequest;
import com.quickkart.model.Order;
import com.quickkart.model.OrderItem;
import com.quickkart.model.Product;
import com.quickkart.model.User;
import com.quickkart.repository.OrderRepository;
import com.quickkart.repository.ProductRepository;
import com.quickkart.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS =
            Map.of(
                "PLACED", Set.of("CONFIRMED", "CANCELLED"),
                "CONFIRMED", Set.of("PROCESSING", "CANCELLED"),
                "PROCESSING", Set.of("OUT_FOR_DELIVERY", "CANCELLED"),
                "OUT_FOR_DELIVERY", Set.of("DELIVERED"),
                "DELIVERED", Set.of(),
                "CANCELLED", Set.of()
            );

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ProductService productService) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productService = productService;
    }

    private User getAuthenticatedUser(String email) {

        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    // Create new order and reserve inventory
    public synchronized Order createOrder(
            OrderRequest request, String email) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Order request cannot be empty");
        }

        User user = getAuthenticatedUser(email);

        if (request.getCustomer() == null ||
                request.getCustomer().isBlank()) {
            throw new IllegalArgumentException(
                    "Customer name is required");
        }

        if (request.getPhone() == null ||
                !request.getPhone().matches("\\d{10}")) {
            throw new IllegalArgumentException(
                    "Enter a valid 10-digit phone number");
        }

        if (request.getAddress() == null ||
                request.getAddress().isBlank()) {
            throw new IllegalArgumentException(
                    "Address is required");
        }

        if (request.getPincode() == null ||
                !request.getPincode().matches("\\d{6}")) {
            throw new IllegalArgumentException(
                    "Enter a valid 6-digit pincode");
        }

        if (request.getItems() == null ||
                request.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "Order must contain at least one item");
        }

        List<OrderItem> orderItems = new ArrayList<>();

        // Aggregate quantities for stock reservation.
        Map<String, Integer> requestedStock = new HashMap<>();

        double total = 0;
        int itemCount = 0;

        // First validate all items and prepare order data.
        for (OrderItemRequest itemRequest : request.getItems()) {

            if (itemRequest == null ||
                    itemRequest.getProductId() == null ||
                    itemRequest.getProductId().isBlank()) {
                throw new IllegalArgumentException(
                        "Product ID is required");
            }

            int quantity = itemRequest.getQuantity();

            if (quantity < 1 || quantity > 100) {
                throw new IllegalArgumentException(
                        "Quantity must be between 1 and 100");
            }

            Product product = productRepository
                    .findById(itemRequest.getProductId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: "
                                    + itemRequest.getProductId()));

            double price = product.getPrice();
            double subtotal = price * quantity;

            OrderItem orderItem = new OrderItem(
                    product.getId(),
                    product.getName(),
                    price,
                    quantity,
                    subtotal
            );

            orderItems.add(orderItem);

            requestedStock.merge(
                    product.getId(),
                    quantity,
                    Integer::sum
            );

            total += subtotal;
            itemCount += quantity;
        }

        // Reserve stock atomically product-by-product.
        Map<String, Integer> successfullyReserved = new HashMap<>();

        try {

            for (Map.Entry<String, Integer> entry
                    : requestedStock.entrySet()) {

                String productId = entry.getKey();
                int quantity = entry.getValue();

                productService.decreaseStock(productId, quantity);

                // Record only after the stock operation succeeds.
                successfullyReserved.put(productId, quantity);
            }

            Order order = new Order();

            order.setCustomer(request.getCustomer());
            order.setUserId(user.getId());
            order.setPhone(request.getPhone());
            order.setAddress(request.getAddress());
            order.setPincode(request.getPincode());
            order.setItems(orderItems);
            order.setTotal(total);
            order.setItemCount(itemCount);
            order.setStatus("PLACED");
            order.setCreatedAt(Instant.now());
            order.setStockReserved(true);

            return orderRepository.save(order);

        } catch (RuntimeException exception) {

            // If reservation or order saving fails,
            // restore every stock quantity reserved so far.
            rollbackReservedStock(
                    successfullyReserved,
                    exception
            );

            throw exception;
        }
    }

    // Roll back reservations if order creation fails
    private void rollbackReservedStock(
            Map<String, Integer> reserved,
            RuntimeException originalException) {

        for (Map.Entry<String, Integer> entry
                : reserved.entrySet()) {

            try {
                productService.restoreStock(
                        entry.getKey(),
                        entry.getValue()
                );
            } catch (RuntimeException rollbackException) {

                originalException.addSuppressed(
                        rollbackException
                );

                System.err.println(
                        "WARNING: Stock rollback failed for product "
                        + entry.getKey()
                );
            }
        }
    }

    // Restore stock for a reserved order
    private void restoreOrderStock(Order order) {

        if (!order.isStockReserved()) {
            return;
        }

        Map<String, Integer> quantities = new HashMap<>();

        if (order.getItems() != null) {

            for (OrderItem item : order.getItems()) {

                if (item == null ||
                        item.getProductId() == null ||
                        item.getQuantity() < 1) {
                    continue;
                }

                quantities.merge(
                        item.getProductId(),
                        item.getQuantity(),
                        Integer::sum
                );
            }
        }

        for (Map.Entry<String, Integer> entry
                : quantities.entrySet()) {

            productService.restoreStock(
                    entry.getKey(),
                    entry.getValue()
            );
        }

        // Prevent restoration from being triggered again.
        order.setStockReserved(false);
    }

    // Customer: Get own orders
    public List<Order> getAllOrders(String email) {

        User user = getAuthenticatedUser(email);

        return orderRepository.findByUserId(user.getId());
    }

    // Customer: Get specific own order
    public Order getOrderById(String id, String email) {

        User user = getAuthenticatedUser(email);

        return orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found"));
    }

    // Customer: Cancel only PLACED orders
    public synchronized Order cancelOrder(
            String id, String email) {

        User user = getAuthenticatedUser(email);

        Order order = orderRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found"));

        if (!"PLACED".equals(order.getStatus())) {
            throw new IllegalArgumentException(
                    "Only PLACED orders can be cancelled by customers");
        }

        restoreOrderStock(order);

        order.setStatus("CANCELLED");

        return orderRepository.save(order);
    }

    // Admin: Get all orders
    public List<Order> getAllOrdersForAdmin() {

        return orderRepository.findAll();
    }

    // Admin: Get orders by status
    public List<Order> getOrdersByStatusForAdmin(String status) {

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Order status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!ALLOWED_TRANSITIONS.containsKey(normalizedStatus)) {
            throw new IllegalArgumentException(
                    "Invalid order status: " + normalizedStatus);
        }

        return orderRepository.findByStatus(normalizedStatus);
    }

    // Admin: Search orders with pagination and newest-first sorting
    public Page<Order> searchOrdersForAdmin(
            String customer,
            int page,
            int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100");
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        if (customer == null || customer.isBlank()) {
            return orderRepository.findAll(pageable);
        }

        return orderRepository.findByCustomerContainingIgnoreCase(
                customer.trim(),
                pageable
        );
    }

    // Admin: Get a specific order
    public Order getOrderByIdForAdmin(String id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found"));
    }

    // Admin: Update order status
    public synchronized Order updateOrderStatus(
            String id, String newStatus) {

        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException(
                    "Order status is required");
        }

        String normalizedStatus = newStatus.trim().toUpperCase();

        if (!ALLOWED_TRANSITIONS.containsKey(normalizedStatus)) {
            throw new IllegalArgumentException(
                    "Invalid order status: " + normalizedStatus);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found"));

        String currentStatus = order.getStatus();

        if (currentStatus == null ||
                !ALLOWED_TRANSITIONS.containsKey(currentStatus)) {
            throw new IllegalArgumentException(
                    "Current order status is invalid");
        }

        Set<String> allowedNextStatuses =
                ALLOWED_TRANSITIONS.get(currentStatus);

        if (!allowedNextStatuses.contains(normalizedStatus)) {
            throw new IllegalArgumentException(
                    "Cannot change order status from "
                    + currentStatus + " to "
                    + normalizedStatus);
        }

        // Admin cancellation also restores inventory.
        if ("CANCELLED".equals(normalizedStatus)) {
            restoreOrderStock(order);
        }

        order.setStatus(normalizedStatus);

        return orderRepository.save(order);
    }
}
