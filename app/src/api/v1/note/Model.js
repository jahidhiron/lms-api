// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const noteSchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    noteInSecond: Number,
    lectureId: { type: ObjectId, ref: "lecture", required: true },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("note", noteSchema);
