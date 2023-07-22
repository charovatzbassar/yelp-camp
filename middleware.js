module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // this is from passport as well
    // store the url which is being requested
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};
