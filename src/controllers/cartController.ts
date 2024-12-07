import { Request, Response } from "express";
import CartService from "../services/cartServices";

export default class CartController {
  // Add an item to the cart
  static async addItemToCart(req: Request, res: Response) {
    const { userId, productId, quantity } = req.body;

    // Input validation
    if (
      !userId ||
      !productId ||
      !quantity ||
      isNaN(parseInt(userId)) ||
      isNaN(parseInt(productId)) ||
      isNaN(parseInt(quantity))
    ) {
      res.status(400).json({
        message:
          "Invalid input. userId, productId, and quantity must be valid numbers.",
      });
      return;
    }

    try {
      const newCartItem = await CartService.addItemToCart(
        parseInt(userId),
        parseInt(productId),
        parseInt(quantity)
      );

      res.status(201).json(newCartItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message, error });
    }
  }

  // Get all items in a user's cart
  static async getUserCart(req: Request, res: Response) {
    const { userId } = req.params;
    console.log("user id : ", userId);

    // Input validation
    if (!userId || isNaN(parseInt(userId))) {
      res.status(400).json({
        message: "Invalid userId. It must be a valid number.",
      });
      return;
    }

    try {
      const cartItems = await CartService.getUserCart(parseInt(userId));
      res.status(200).json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cart items.", error });
    }
  }

  // Update the quantity of an item in the cart
  static async updateCartItem(req: Request, res: Response) {
    const { cartItemId } = req.params;
    const { newQuantity } = req.body;

    // Input validation
    if (
      !cartItemId ||
      isNaN(parseInt(cartItemId)) ||
      !newQuantity ||
      isNaN(parseInt(newQuantity))
    ) {
      res.status(400).json({
        message:
          "Invalid input. cartItemId and newQuantity must be valid numbers.",
      });
      return;
    }

    try {
      const updatedCartItem = await CartService.updateCartItem(
        parseInt(cartItemId),
        parseInt(newQuantity)
      );

      res.status(200).json(updatedCartItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message, error });
    }
  }

  // Remove an item from the cart
  static async removeCartItem(req: Request, res: Response) {
    const { cartItemId } = req.params;

    // Input validation
    if (!cartItemId || isNaN(parseInt(cartItemId))) {
      res.status(400).json({
        message: "Invalid cartItemId. It must be a valid number.",
      });
      return;
    }

    try {
      const deleted = await CartService.removeCartItem(parseInt(cartItemId));

      if (!deleted) {
        res.status(404).json({ message: "Cart item not found." });
        return;
      }

      res.status(200).json({ message: "Cart item deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error deleting cart item.", error });
    }
  }
}
