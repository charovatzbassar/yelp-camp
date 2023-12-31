const express = require("express");
const router = express.Router({ mergeParams: true }); // access to params from the prefix
const catchAsync = require("../utils/catchAsync");
const reviews = require("../controllers/reviews");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
  isNotAuthor,
} = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  isNotAuthor,
  validateReview,
  catchAsync(reviews.createReview)
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
