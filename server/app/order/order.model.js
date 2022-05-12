const mongoose = require("mongoose");

const { ObjectId, Number } = mongoose.Schema.Types;

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    items: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: ObjectId,
          ref: "Product",
        },
        size: {
          type: String,
        },
        color: {
          type: String,
        },
        prodImage: {
          type: String,
        },        
        refunded: {
          type: Boolean
        }, 
        refund_date: {
          type: Date
        }, 
      },
    ],
    shippingInfo: {
      type: {},
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    payment_intent: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'pending',      
      required: true
    },
    orderNo: {
      type: String,   
      required: true
    },
    shipped_date: {
      type: Date
    },
    refund_date: {
      type: Date
    },
    refund_id: {
      type: String
    },

  },
  {
    timestamps: true,
  }
);

mongoose.model("Order", OrderSchema, 'ardene-orders');
