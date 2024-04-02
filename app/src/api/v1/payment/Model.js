// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const paymentSchema = Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, trim: true, required: true },
    ip: { type: String, required: true },
    tranxId: { type: String, trim: true, required: true },
    paymentId: { type: String, trim: true, required: true },
    buyerName: { type: String, trim: true, required: true },
    buyerEmail: { type: String, trim: true, required: true },
    buyerAccount: { type: String, trim: true, required: true },
    buyerAddress: {},
    courseId: { type: ObjectId, ref: "course" },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    updatedByAdmin: { type: ObjectId, ref: "user" },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("payment", paymentSchema);
