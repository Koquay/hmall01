const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  store: String,
  description: String,
  style: String,
  type: String,
  price: Number,
  list_price: Number,
  rating: Number,
  images: [],
  category: String,
  brand: String,
  sizes: [],
  colors: []
  
});
mongoose.model("Product", ProductSchema, "ardene-products");

const ProductTypeSchema = new Schema({
  type: String,
  style: String,
  sizes: [],
  colors: []  
});
mongoose.model("ProductTypes", ProductTypeSchema, "ardene-product-types");

