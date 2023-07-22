const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.plugin(passportLocalMongoose); // adds username and passport fields, and additional methods

module.exports = model("User", userSchema);
