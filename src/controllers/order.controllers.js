import { request, response } from "express";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { calcOrderPrices } from "../utils/calcPrices.js";
import braintree from "braintree";

//CREATE ORDER
export const CreateOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, totalPrice, taxPrice, shippingPrice } = req.body;
        console.log(orderItems)

        if ([shippingAddress, paymentMethod, orderItems, itemsPrice, totalPrice, taxPrice, shippingPrice].some(item => !item)) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Please provide all required fields"
                }
            )
        }

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No order items"
            });
        }

        // fetches the product details from the database for all the products included in orderItems
        const ItemsFromDB = await Product.find({
            _id: {
                $in: orderItems.map(i => i._id),
            }
        })

        // console.log("ItemsFromDB", ItemsFromDB);

        const orderItemsFromDB = orderItems.map(i => {
            const matchItems = ItemsFromDB.find(item => item?._id?.toString() === i?._id?.toString());
            if (!matchItems) {
                throw new Error("Items not found");
            }

            return {
                ...i,
                product: i._id,
                price: matchItems.price,
                seller: matchItems.seller,
                image: matchItems.images[0]
            }
        })

        // const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calcOrderPrices(orderItemsFromDB);
        // console.log("orderItemsFromDB", orderItemsFromDB);

        const order = await Order.create({
            orderItems: orderItemsFromDB,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            user: req.user._id,
            isPaid: false,
            isDelivered: false,
        });

        return res.status(201).json({
            success: true,
            data: order,
            message: "Order created successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// GET ALL ORDER LISTS FOR ADMIN
export const Orders = async (req, res) => {
    try {
        const orders = await Order.find({});
        if (!orders) {
            return res.status(409).json({
                success: false,
                message: "Unable to fetch"
            })
        }
        const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        return res.status(200).json(
            {
                success: true,
                data: orders,
                totalOrdersCount: orders.length,
                totalSales
            }
        )
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// GET ORDER BY ID
export const GetOrderBy = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "firstName lastName email");

        if(!order){
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// GET ALL ORDERLISTS FOR USER
export const UserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        if (!orders) {
            return res.status(409).json({
                success: false,
                message: "Unable to fetch"
            })
        }
        return res.status(200).json(
            {
                success: true,
                data: orders
            }
        )
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// GET ALL ORDERLISTS FOR SELLERS
export const SellerOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        if(!orders) {
            return res.status(409).json({
                success: false,
                message: "Unable to fetch"
            });
        }

        const sellerOrders = [];

        // Iterate over each order
        orders.map(order => {
            // Filter orderItems where seller matches req.user._id
            const filteredItems = order.orderItems.filter(item => item.seller.toString() === req.user._id.toString());
            // console.log("filteredItems", filteredItems);

            // If there are any filtered items, create a new order object with those items
            if (filteredItems.length > 0) {
                sellerOrders.push({
                    ...order._doc, // Spread the original order properties
                    orderItems: filteredItems // Override orderItems with the filtered items
                });
            }
        });
        
        return res.status(200).json(
            {
                success: true,
                data: sellerOrders
            }
        )

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//TOTAL ORDERS COUNT
export const TotalCount = async (req, res) => {
    try {
        const totalOrdersCount = await Order.countDocuments();
        return res.status(200).json(
            { 
                success: true,
                data: totalOrdersCount
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//TOTAL SALES OF ORDER
export const TotalSales = async (req, res) => {
    try {
        const orders = await Order.find({});
        const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
        return res.status(200).json(
            { 
                success: true,
                data: totalSales
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// TOTAL SALES OF ORDER BY DATE
export const TotalSalesByDate = async (req, res) => {
    try {
        const salesByDate = await Order.aggregate([
            {
              $match: {
                isPaid: true,
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
                },
                totalSales: { $sum: "$totalPrice" },
              },
            },
          ]);

        return res.status(200).json(
            { 
                success: true,
                data: salesByDate
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// TOTAL SALES OF ORDER BY DATE FOR CORRESPONDING SELLER
export const TotalSalesByDateForSeller = async (req, res) => {
    try {
        const sellerId = req.user._id; // Assuming req.user._id contains the seller's ID

        const salesByDate = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    "orderItems.seller": sellerId // Match orders where seller matches req.user._id
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
                    },
                    totalSales: { $sum: "$totalPrice" },
                },
            },
        ]);

        return res.status(200).json(
            { 
                success: true,
                data: salesByDate
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const TotalSalesBySeller = async (req, res) => {
    try {
        const sellerId = req.user._id; // Assuming req.user._id contains the seller's ID

        const totalSales = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                    "orderItems.seller": sellerId // Match orders where seller matches req.user._id
                },
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalPrice" },
                },
            },
        ]);

        if (totalSales.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No sales found for the seller",
            });
        }

        return res.status(200).json(
            { 
                success: true,
                data: totalSales[0].totalSales // Return total sales amount
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}



// // MARKING THE ORDER AS PAYED
export const MarkAsPayed = async (req, res) => {
    try {
        const {id, status, updateTime, emailAddress} = req.body;
        if([status, updateTime, emailAddress, id].some(field => !field)) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Please provide all required fields"
                }
            )
        }
        const order = await Order.findById(req.params.id);
        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
       await order.orderItems.map(async (item) => {
            const product = await Product.findById(item.product);
            if(product) {
                product.quantity -= item.qty
                await product.save();
            }
        })
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id,
            status,
            updateTime,
            emailAddress
        }
        const updateOrder = await order.save();
        return res.status(200).json(
            {
                success: true,
                data: updateOrder
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// MARKING THE ORDER AS DELIVERED
export const MarkAsDelivered = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if(!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updateOrder = await order.save();
        return res.status(200).json(
            {
                success: true,
                data: updateOrder
            }
        );
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//PAYMENT GATEWAY
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });

//GETTING PAYMENT TOKEN
export const PaymentToken = async (req, res) => {
    try {
        gateway.clientToken.generate({}, (err, response) => {
            if(err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            } else {
                return res.status(200).json({
                    success: true,
                    data: response
                })
            }
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// PAYMENT
export const Payment = async (req, res) => {
    try {
        // Extract orderId and nonce from request body
        const { orderId, nonce } = req.body;

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get the total price from the order
        const totalPrice = order.totalPrice;

        // Process the payment transaction
        let newTransaction = gateway.transaction.sale({
            amount: totalPrice,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        }, async (err, response) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (response.success) {
                // Update order details on successful payment
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: response.transaction.id,
                    status: response.transaction.status,
                    updateTime: response.transaction.updatedAt,
                };
                await order.orderItems.map(async (item) => {
                    const product = await Product.findById(item.product);
                    if(product) {
                        product.quantity -= item.qty
                        await product.save();
                    }
                })
                // Save the updated order
                const updatedOrder = await order.save();

                return res.status(200).json({
                    success: true,
                    data: updatedOrder,
                    message: "Payment completed successfully"
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: response.message || "Payment failed"
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};