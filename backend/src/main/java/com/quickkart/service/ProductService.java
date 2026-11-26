
package com.quickkart.service;

import com.quickkart.model.Product;
import com.quickkart.repository.ProductRepository;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final MongoTemplate mongoTemplate;

    public ProductService(
            ProductRepository productRepository,
            MongoTemplate mongoTemplate) {
        this.productRepository = productRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Product addProduct(Product product) {

        if (product.getStockQuantity() < 0 ||
                product.getLowStockThreshold() < 0) {
            throw new IllegalArgumentException(
                    "Stock values cannot be negative");
        }

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get products whose stock is at or below threshold
    public List<Product> getLowStockProducts() {
        return productRepository.findAll()
                .stream()
                .filter(product ->
                        product.getStockQuantity()
                                <= product.getLowStockThreshold())
                .collect(Collectors.toList());
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public Optional<Product> updateProduct(
            String id, Product updatedProduct) {

        return productRepository.findById(id).map(existingProduct -> {

            existingProduct.setName(updatedProduct.getName());
            existingProduct.setDesc(updatedProduct.getDesc());
            existingProduct.setPrice(updatedProduct.getPrice());
            existingProduct.setCategory(updatedProduct.getCategory());
            existingProduct.setIcon(updatedProduct.getIcon());
            existingProduct.setTime(updatedProduct.getTime());

            return productRepository.save(existingProduct);
        });
    }

    // Admin: Update stock quantity and threshold
    public Product updateStock(
            String productId,
            int quantity,
            int lowStockThreshold) {

        if (quantity < 0 || lowStockThreshold < 0) {
            throw new IllegalArgumentException(
                    "Stock values cannot be negative");
        }

        Query query = new Query(
                Criteria.where("_id").is(productId));

        Update update = new Update()
                .set("stockQuantity", quantity)
                .set("lowStockThreshold", lowStockThreshold);

        Product updatedProduct = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Product.class
        );

        if (updatedProduct == null) {
            throw new IllegalArgumentException("Product not found");
        }

        return updatedProduct;
    }

    // Atomically decrease stock when an order is placed
    public Product decreaseStock(String productId, int quantity) {

        if (quantity < 1) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        Query query = new Query(
                Criteria.where("_id").is(productId)
                        .and("stockQuantity").gte(quantity));

        Update update = new Update()
                .inc("stockQuantity", -quantity);

        Product updatedProduct = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Product.class
        );

        if (updatedProduct == null) {
            throw new IllegalArgumentException(
                    "Insufficient stock or product not found: " + productId);
        }

        return updatedProduct;
    }

    // Restore stock when an order is cancelled
    public void restoreStock(String productId, int quantity) {

        if (quantity < 1) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        Query query = new Query(
                Criteria.where("_id").is(productId));

        Update update = new Update()
                .inc("stockQuantity", quantity);

        Product updatedProduct = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Product.class
        );

        if (updatedProduct == null) {
            throw new IllegalArgumentException("Product not found");
        }
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }
}
