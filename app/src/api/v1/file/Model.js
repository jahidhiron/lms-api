// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const fileSchema = Schema(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
    // 1 -> avatar, 2 -> thumbnail, 3 -> video, 4 -> document, 5 -> assignmentFile, 6 -> assignmentVideo, 7 -> subtitle
    type: Number,
    size: Number,
    mimetype: String,
    timeLength: Number,
    updatedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
    deletedBy: { type: ObjectId, ref: "user" },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// reference
module.exports = model("file", fileSchema);
