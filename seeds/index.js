const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// same as then catch
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const randomLocation = sample(cities);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "64bbde28e8ff6fc22ee8837d",
      location: `${randomLocation.city}, ${randomLocation.state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251", // always random
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa perferendis ad atque neque doloribus consectetur, a rerum expedita laborum. Dolore incidunt aut fugit fugiat consequuntur laudantium doloremque repellat amet tempora.",
      price,
    });
    await camp.save();
  }
};

seedDB()
  .then(() => mongoose.connection.close()) // stop the app
  .catch((e) => console.log(e));
