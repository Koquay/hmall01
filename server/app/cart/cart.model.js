const mongoose = require("mongoose");

const { ObjectId, Number } = mongoose.Schema.Types;

const CartSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  items: [
    {
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      product: {
        type: ObjectId,
        ref: "Product",
        required: true,
      },
      size: {
        type: String,
        // required: true,
      },
      color: {
        type: String,
        // required: true,
      },
      prodImage: {
        type: String,
      }, 
    },
  ],
});

const Cart = mongoose.model("Cart", CartSchema, 'ardene-cart');
