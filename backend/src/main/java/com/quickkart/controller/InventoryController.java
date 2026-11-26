
package com.quickkart.controller;

import com.quickkart.dto.InventoryUpdateRequest;
import com.quickkart.model.Product;
import com.quickkart.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inventory")
public class InventoryController {

    private final ProductService productService;

    public InventoryController(ProductService productService) {
        this.productService = productService;
    }

    // Update product inventory
    @PatchMapping("/{productId}")
    public ResponseEntity<Product> updateInventory(
            @PathVariable String productId,
            @Valid @RequestBody InventoryUpdateRequest request) {

        Product updatedProduct = productService.updateStock(
                productId,
                request.getStockQuantity(),
                request.getLowStockThreshold()
        );

        return ResponseEntity.ok(updatedProduct);
    }

    // Get all products with low stock
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts() {

        List<Product> products = productService.getLowStockProducts();

        return ResponseEntity.ok(products);
    }
}
