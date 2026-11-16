
package com.quickkart.controller;

import com.quickkart.dto.OrderStatusRequest;
import com.quickkart.model.Order;
import com.quickkart.service.OrderService;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Admin: Get all customers' orders
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {

        List<Order> orders = orderService.getAllOrdersForAdmin();

        return ResponseEntity.ok(orders);
    }

    // Admin: Search orders with pagination
    @GetMapping("/search")
    public ResponseEntity<Page<Order>> searchOrders(
            @RequestParam(required = false) String customer,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        Page<Order> orders =
                orderService.searchOrdersForAdmin(customer, page, size);

        return ResponseEntity.ok(orders);
    }

    // Admin: Get orders filtered by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @PathVariable String status) {

        List<Order> orders =
                orderService.getOrdersByStatusForAdmin(status);

        return ResponseEntity.ok(orders);
    }

    // Admin: Get any order by ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable String id) {

        Order order = orderService.getOrderByIdForAdmin(id);

        return ResponseEntity.ok(order);
    }

    // Admin: Update order status
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable String id,
            @RequestBody OrderStatusRequest request) {

        Order updatedOrder = orderService.updateOrderStatus(
                id,
                request.getStatus()
        );

        return ResponseEntity.ok(updatedOrder);
    }

    // Handle invalid requests
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(
            IllegalArgumentException exception) {

        return ResponseEntity.badRequest()
                .body(exception.getMessage());
    }
}
