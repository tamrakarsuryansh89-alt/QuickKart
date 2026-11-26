
package com.quickkart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name cannot exceed 100 characters")
    private String name;

    private String desc;

    @Positive(message = "Product price must be greater than zero")
    private double price;

    @NotBlank(message = "Product category is required")
    private String category;

    private String icon;

    @NotBlank(message = "Delivery time is required")
    private String time;

    @PositiveOrZero(message = "Stock quantity cannot be negative")
    private Integer stockQuantity = 0;

    @PositiveOrZero(message = "Low stock threshold cannot be negative")
    private Integer lowStockThreshold = 5;

    public Product() {
    }

    // Existing constructor retained for compatibility
    public Product(String name, String desc, double price,
                   String category, String icon, String time) {
        this.name = name;
        this.desc = desc;
        this.price = price;
        this.category = category;
        this.icon = icon;
        this.time = time;
        this.stockQuantity = 0;
        this.lowStockThreshold = 5;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Integer getStockQuantity() {
        return stockQuantity == null ? 0 : stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold == null ? 5 : lowStockThreshold;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }
}
