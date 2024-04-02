// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const subCategorySchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true },
    desc: { type: String, trim: true },
    categoryId: { type: ObjectId, ref: "category", required: true },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("sub-category", subCategorySchema);
