const express = require("express");
const router = express.Router({ mergeParams: true }); // access to params from the prefix
const catchAsync = require("../utils/catchAsync");
const Review = require("../models/review");
const Campground = require("../models/campground");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { reviewId, id } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // pull for removing from array in model
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted review!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
