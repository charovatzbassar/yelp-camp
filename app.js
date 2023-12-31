if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
} // when in development, use the env variables

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // making sense of ejs
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const passport = require("passport");
const localStrategy = require("passport-local"); // way to login
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo")(session);

//const dbUrl = "mongodb://127.0.0.1:27017/yelp-camp";
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize()); // prohibits using $ and . in query strings
app.use(helmet()); // content security policy = whitelist

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://images.unsplash.com/",
        "https://source.unsplash.com/collection/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

const store = new MongoStore({
  // store sessions in db, not in memory, removed after 14 days
  url: process.env.DB_URL,
  secret: process.env.SESSION_SECRET,
  touchAfter: 24 * 3600, // update session once every 24 hours
});

store.on("error", function (e) {
  console.log(e);
});

const sessionConfig = {
  store,
  name: "session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // its true by default, for extra security, not accessed via js
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // when the session expires
    maxAge: 1000 * 60 * 60 * 24 * 7, // how long the session lasts
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize()); // init passport
app.use(passport.session()); // for persistent login sessions, must be below app.session
passport.use(new localStrategy(User.authenticate())); // use local strategy to authenticate our user
passport.serializeUser(User.serializeUser()); // how to store the user in the session
passport.deserializeUser(User.deserializeUser()); // how to remove the user

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(status).render("error", { err });
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});
