const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { reviewId, id } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // pull for removing from array in model
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Deleted review!");
  res.redirect(`/campgrounds/${id}`);
};
