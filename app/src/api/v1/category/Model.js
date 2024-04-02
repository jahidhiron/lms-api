// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const categorySchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true },
    desc: { type: String, trim: true },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("category", categorySchema);
