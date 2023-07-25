const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const Review = require("./review");

const opts = { toJSON: { virtuals: true } }; // include virtuals in JSON

const campgroundSchema = new Schema(
  {
    title: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    }, // following the GeoJSON pattern
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

campgroundSchema.post("findOneAndDelete", async function (campground) {
  if (campground) {
    await Review.deleteMany({
      _id: {
        $in: campground.reviews,
      },
    });
  }
});

campgroundSchema.virtual("properties.popupMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

module.exports = model("Campground", campgroundSchema);
