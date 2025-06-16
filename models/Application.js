import mongoose from "mongoose";

// Application Schema for MongoDB.
const applicationSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  company: {
    type: String,
    default: "N/A",
  },
  position: {
    type: String,
    default: "N/A",
  },
  location: {
    type: String,
    default: "N/A",
  },
  status: {
    type: String,
    enum: ["Applied", "Interview", "Offer", "Rejected"],
    default: "Applied",
  },
  workMode: {
    type: String,
    enum: ["In-Person", "Remote", "Hybrid"],
    default: "In-Person",
  },
  linkToPosting: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Application = mongoose.model("Application", applicationSchema);

export default Application;
