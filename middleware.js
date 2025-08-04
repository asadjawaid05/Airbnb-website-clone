const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js"); // Custom error handler
const { listingSchema, reviewSchema } = require("./schema.js"); // Import Joi validation schemas
const Review = require("../MAJOR-PROJECT/models/review.js");


// Middleware function to validate listing data before processing
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body); // Validate request body against schema
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); // Extract error messages
    throw new ExpressError(400, errMsg); // Throw error with status code 400
  } else {
    next(); // Proceed to next middleware if no validation errors
  }
};

// Middleware: Validate review data before saving
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body); // Validate request body using Joi schema
  if (error) {
      let errMsg = error.details.map((el) => el.message).join(","); // Extract error messages
      throw new ExpressError(400, errMsg); // Throw an error if validation fails
  } else {
      next(); // Proceed if validation passes
  }
};


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create a new Listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "you don't have permission to edit! you are not the owner of this Listing..");
    return res.redirect(`/listings/${id}`);
  }
  next();
}


module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId); // 🔥 Capital 'R'
  if (!review.author.equals(res.locals.currUser._id)) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/listings/${id}`);
  }
  next();
}