
package com.quickkart.service;

import com.quickkart.dto.OrderRequest;
import com.quickkart.dto.OrderItemRequest;
import com.quickkart.model.Order;
import com.quickkart.model.OrderItem;
import com.quickkart.model.Product;
import com.quickkart.repository.OrderRepository;
import com.quickkart.repository.ProductRepository;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    // Create new order
    public Order createOrder(OrderRequest request) {

        // 1. Validate customer details
        if (request == null) {
            throw new IllegalArgumentException("Order details are required");
        }

        if (request.getCustomer() == null ||
                request.getCustomer().isBlank()) {
            throw new IllegalArgumentException("Customer name is required");
        }

        if (request.getPhone() == null ||
                !request.getPhone().matches("\\d{10}")) {
            throw new IllegalArgumentException("Enter a valid 10-digit phone number");
        }

        if (request.getAddress() == null ||
                request.getAddress().isBlank()) {
            throw new IllegalArgumentException("Delivery address is required");
        }

        if (request.getPincode() == null ||
                !request.getPincode().matches("\\d{6}")) {
            throw new IllegalArgumentException("Enter a valid 6-digit pincode");
        }

        if (request.getItems() == null ||
                request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one product");
        }

        // 2. Prepare order items
        List<OrderItem> orderItems = new ArrayList<>();

        double total = 0;
        int itemCount = 0;

        for (OrderItemRequest itemRequest : request.getItems()) {

            if (itemRequest == null ||
                    itemRequest.getProductId() == null ||
                    itemRequest.getProductId().isBlank()) {
                throw new IllegalArgumentException("Invalid product details");
            }

            int quantity = itemRequest.getQuantity();

            if (quantity <= 0 || quantity > 100) {
                throw new IllegalArgumentException("Quantity must be between 1 and 100");
            }

            // 3. Get original product from MongoDB
            Product product = productRepository
                    .findById(itemRequest.getProductId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Product not found: "
                                    + itemRequest.getProductId()));

            // 4. Calculate subtotal using database price
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

            total += subtotal;
            itemCount += quantity;
        }

        // 5. Create complete order
        Order order = new Order();

        order.setCustomer(request.getCustomer().trim());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress().trim());
        order.setPincode(request.getPincode());

        order.setItems(orderItems);
        order.setTotal(total);
        order.setItemCount(itemCount);
        order.setStatus("PLACED");
        order.setCreatedAt(Instant.now());

        // 6. Save order in MongoDB
        return orderRepository.save(order);
    }

    // Get order by ID
    public Order getOrderById(String id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found: " + id));
    }

    // Get all orders
    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }

    // Cancel existing order
    public Order cancelOrder(String id) {

        // 1. Find order in MongoDB
        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found: " + id));

        // 2. Check whether order can be cancelled
        if (!"PLACED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException(
                    "Only PLACED orders can be cancelled"
            );
        }

        // 3. Update order status
        order.setStatus("CANCELLED");

        // 4. Save updated order in MongoDB
        return orderRepository.save(order);
    }
}
