// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// define schema
const messageSchema = Schema(
  {
    conversationId: { type: ObjectId, ref: "conversation", required: true },
    senderId: { type: ObjectId, ref: "user", required: true },
    msg: String,
    fileId: { type: ObjectId, ref: "file" },
    isEdited: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: { type: Date },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// model reference
module.exports = model("message", messageSchema);
