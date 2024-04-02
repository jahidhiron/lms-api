// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// define schema
const conversationSchema = Schema(
  {
    receiverId: { type: ObjectId, ref: "user", required: true },
    courseId: { type: ObjectId, ref: "course", required: true },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: { type: Date },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// model reference
module.exports = model("conversation", conversationSchema);
