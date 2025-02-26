import express from "express";
import * as productController from "../controllers/productController";

export const productRoutes = express.Router();

// Route for get all new arrivals products
productRoutes.get(
  "/newArrivals/all",
  productController.getAllNewArrivalsProducts
);

// Route for get 4 new arrivals products
productRoutes.get("/newArrivals", productController.getNewArrivalsProducts);

// Route for get all products based on user search
productRoutes.get("/search/:text", productController.findProductsByText);

// Route for get a specific product based on id
productRoutes.get("/product/:id", productController.findProductById);

// Route for get all products that are related to category
productRoutes.get(
  "/products/:category",
  productController.findProductsByCategory
);

// Route for get products that are related to a specific product
productRoutes.get(
  "/products/:category/:productId",
  productController.getRelatedProducts
);

// Route for brands
productRoutes.get("/brands", productController.getBrands);

// Route for handpicked
productRoutes.get("/:categoryId/handpicked", productController.getHandPicked);

productRoutes.get(
  "/product/brand/:brandName",
  productController.getProductsByBrand as any
);
productRoutes.post(
  "/product/create",
  productController.createProductController as any
);

//handpicked collection list
productRoutes.get(
  "/handpicked-list",
  productController.getHandpickedCollectionList
);
