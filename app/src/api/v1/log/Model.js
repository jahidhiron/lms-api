// lib
const { Schema, model, Types } = require("mongoose");

const logSchema = Schema({
  title: { type: String, required: true },
  desc: { type: String },
  user: {
    type: Types.ObjectId,
    ref: "user",
  },
  ip: { type: String, required: true },
  createdAt: { type: Date, default: new Date().getTime() },
});

module.exports = model("log", logSchema);
