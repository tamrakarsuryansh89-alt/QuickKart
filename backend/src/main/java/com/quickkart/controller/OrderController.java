
package com.quickkart.controller;

import com.quickkart.dto.OrderRequest;
import com.quickkart.model.Order;
import com.quickkart.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Create new order
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderRequest request,
            Authentication authentication) {

        Order savedOrder = orderService.createOrder(
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedOrder);
    }

    // Get logged-in user's orders
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(
            Authentication authentication) {

        List<Order> orders = orderService.getAllOrders(
                authentication.getName()
        );

        return ResponseEntity.ok(orders);
    }

    // Get order by ID, only for its owner
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable String id,
            Authentication authentication) {

        Order order = orderService.getOrderById(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(order);
    }

    // Cancel order, only by its owner
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable String id,
            Authentication authentication) {

        Order cancelledOrder = orderService.cancelOrder(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(cancelledOrder);
    }

    // Handle invalid requests
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(
            IllegalArgumentException exception) {

        return ResponseEntity
                .badRequest()
                .body(exception.getMessage());
    }
}
