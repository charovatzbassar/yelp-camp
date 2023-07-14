const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  body: String,
  rating: Number,
});

module.exports = model("Review", reviewSchema);
