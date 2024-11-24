import { User } from "./UserModel";
import { WishlistItem } from "./WishListItemModel";
import { CartItem } from "./CartItemModel";
import { Rating } from "./RatingModel";
import { Product } from "./ProductModel";
import { Category } from "./CategoryModel";
import { Merchant } from "./MerchantModel";
import { ProductCategory } from "./ProductCategoryModel";

import colors from "colors";

/**
 * Sets up associations between models
 **/
export const setupAssociations = () => {
  /**
   * Many-to-many relationship between products and categories.
   * Each product can have many categories, and each category can have many products.
   */
  Product.belongsToMany(Category, {
    through: ProductCategory,
    foreignKey: "product_id",
    otherKey: "category_id",
  });

  Category.belongsToMany(Product, {
    through: ProductCategory,
    foreignKey: "category_id",
    otherKey: "product_id",
  });

  /**
   * One-to-many relationship between products and merchants.
   * Each product belongs to one merchant, but a merchant can have many products.
   */
  Merchant.hasMany(Product, {
    foreignKey: "merchant_id",
    onDelete: "CASCADE",
  });

  Product.belongsTo(Merchant, {
    foreignKey: "merchant_id",
  });

  /**
   * One-to-many relationship between users and ratings.
   * Each user can have many ratings, but a rating can only belong to one user.
   */
  User.hasMany(Rating, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });

  Rating.belongsTo(User, {
    foreignKey: "user_id",
  });

  /**
   * One-to-many relationship between products and ratings.
   * Each product can have many ratings, but a rating can only belong to one product.
   */
  Product.hasMany(Rating, {
    foreignKey: "product_id",
    onDelete: "CASCADE",
  });

  Rating.belongsTo(Product, {
    foreignKey: "product_id",
  });

  /**
   * Many-to-many relationship between user and products.
   * Each user can add multiple products on cart, and each product can be added from different users on cart.
   */
  User.belongsToMany(Product, {
    through: CartItem,
    foreignKey: "user_id",
    otherKey: "product_id",
  });

  Product.belongsToMany(User, {
    through: CartItem,
    foreignKey: "product_id",
    otherKey: "user_id",
  });

  /**
   * Many-to-many relationship between user and products.
   * Each user can add multiple products on wishlist, and each product can be added from different users on wishlist.
   */
  User.belongsToMany(Product, {
    through: WishlistItem,
    foreignKey: "user_id",
    otherKey: "product_id",
  });

  Product.belongsToMany(User, {
    through: WishlistItem,
    foreignKey: "product_id",
    otherKey: "user_id",
  });

  //success message
  console.log(colors.green("Models associations created successfully."));
};
