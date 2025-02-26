import { Request, Response, NextFunction } from "express";

import UserService from "../services/userServices";
import { sequelize } from "../config/db";
import { Product } from "../models/ProductModel";
import { CartItem } from "../models/CartItemModel";
import { productService } from "../services/productService";
import { orderService } from "../services/orderService";
import { OrderItem } from "../models/OrderItem";
import { orderItemService } from "../services/orderItemService";
import { Sequelize, Transaction } from "sequelize";



export const getCheckoutInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Log the request to see where the token is located
    console.log("Request Object:", req);
    // Get the user ID from the request token (assuming authentication middleware is in place)
    const userId = (req as any).token?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized, no valid user ID found." });
      return;
    }
    // Fetch user data using UserService
    const user = await UserService.getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Prepare the required user information for checkout
    const checkoutInfo = {
    //   id: user.user_id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
    };

    // Send the response back to the client
    res.status(200).json(checkoutInfo);
  } catch (error) {
    console.error("Error fetching checkout information:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    
    const userId = (req as any).token?.id;

    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized, no valid user ID found." });
      return;
    }

    // Extract the new address from the request body
    const { address } = req.body;

    // Validate that the address is provided
    if (!address) {
      res.status(400).json({ message: "Address is required." });
      return;
    }

    // Update the user's address using the UserService
    const updatedUser = await UserService.updateUserAddress(userId, address);

    // Respond with a success message and updated user data
    res.status(200).json({ message: "Address updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Error updating user address:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



export const checkoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await sequelize.transaction(async (t: any) => {
      try {
        const { user_id } = req.body;
        //1- fetch cart data
        const productList = await productService.getCartProducts(user_id);
        console.log(productList[0].dataValues.CartItems);

        //2- check stock
        for (const product of productList) {
          const isAvaiable = await productService.checkStock(
            product.dataValues.product_id,
            product.dataValues.CartItems[0].dataValues.quantity
          );

          if (!isAvaiable) {
            throw new Error(
              `Insufficient stock for product ID ${product.dataValues.product_id}`
            );
          }
        }
        //3- calculate total
        const total = productList.reduce((sum, product) => {
          productService.addDiscountInfo(product.dataValues);
          return (
            sum +
            product.dataValues.price_after_discount *
              product.dataValues.CartItems[0].dataValues.quantity
          );
        }, 0);

        //4-simulate payment
        const simulatePatment = simulatePayment(total);
        if (!simulatePatment) {
          const order = await orderService.createOrder(user_id, total, 0);

          throw new Error("Patment Faild");
        }
        //5- update order , orderItem tables ans stock in product table

        const order = await orderService.createOrder(user_id, total, 1);

        const orderItems = productList.map((product) => ({
          quantity: product.dataValues.CartItems[0].dataValues.quantity,
          user_id,
          product_id: product.dataValues.product_id,
          order_id: order.dataValues.order_id,
        }));

        await orderItemService.bulkCreateItems(orderItems);

        //update the stock
        for (const product of productList) {
          await productService.updateStock(
            product.dataValues.product_id,
            product.dataValues.CartItems[0].dataValues.quantity,
            "sub"
          );
        }
        await t.commit();

        res.status(202).json({
          order: productList,
          total,
        });
      } catch (error) {
        await t.rollback();
        res.status(400).json({
          message: error.message,
        });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const orderHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.body;
    const orders = await orderService.getAllOrders(user_id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      details: error,
    });
  }
};

export const orderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order_id = parseInt(req.params.order_id);
    const { user_id } = req.body;

    if (!order_id) throw new Error("no order id provided");

    const orderItems = await productService.getOrderProducts(order_id);

    res.status(200).json(orderItems);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      details: error,
    });
  }
};

// Simulate a payment function
function simulatePayment(amount: number): boolean {
  return Math.random() > 0.2;
}
