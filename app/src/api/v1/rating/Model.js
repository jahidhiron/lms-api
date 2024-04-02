// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const ratingSchema = Schema(
  {
    rating: { type: Number, trim: true, required: true },
    courseId: { type: ObjectId, ref: "course", required: true },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("rating", ratingSchema);
