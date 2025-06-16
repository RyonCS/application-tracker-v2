import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
const Schema = mongoose.Schema;

// User Schema for MongoDB.
const userSchema = new Schema({
  emailAddress: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Adds username and password to schema; setting username as email address.
userSchema.plugin(passportLocalMongoose, { usernameField: "emailAddress" });

export default mongoose.model("User", userSchema);
