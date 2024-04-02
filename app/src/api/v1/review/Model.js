// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const review = Schema(
  {
    msg: { type: String, trim: true },
    courseId: { type: ObjectId, ref: "course", required: true },
    rating: { type: Number, trim: true, required: true },
    reply: [
      {
        msg: String,
        updatedBy: { type: ObjectId, ref: "user" },
        updatedByAdmin: { type: ObjectId, ref: "user" },
        createdAt: Date,
        updatedAt: Date,
        isDelete: { type: Boolean, default: false },
        deletedBy: { type: ObjectId, ref: "user" },
        deletedAt: Date,
      },
    ],
    updatedBy: { type: ObjectId, ref: "user", required: true },
    updatedByAdmin: { type: ObjectId, ref: "user" },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedByAdmin: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("review", review);
