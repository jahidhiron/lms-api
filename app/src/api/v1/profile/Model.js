// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const profileSchema = Schema(
  {
    title: { type: String, trim: true },
    bio: { type: String, trim: true },
    website: String,
    linkedIn: String,
    facebook: String,
    youtube: String,
    twitter: String,
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("profile", profileSchema);
