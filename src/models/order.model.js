import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        orderItems: [
            {
                name: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                image: {
                    publicId: String,
                    url: String
                },
                price: {
                    type: Number,
                    required: true
                },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "Product",

                },
                seller: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "User",
                }
            },
        ],

        shippingAddress: {
            address: {
                type: String,
                required: true

            },
            city: {
                type: String,
                required: true

            },
            postalCode: {
                type: Number,
                required: true
            },
            country: {
                type: String,
                required: true

            },
            phone: {
                type: Number,
                required: true
            }
        },

        paymentMethod: {
            type: String,
            required: true,
        },

        paymentResult: {
            id: {
                type: String
            },
            status: {
                type: String
            },
            updateTime: {
                type: String
            },
            emailAddress: {
                type: String
            },
        },

        itemsPrice: {
            type: Number,
            required: true,
            default: 0,
        },

        taxPrice: {
            type: Number,
            required: true,
            default: 0,
        },

        shippingPrice: {
            type: Number,
            required: true,
            default: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },

        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },

        paidAt: {
            type: Date,
        },

        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },

        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
