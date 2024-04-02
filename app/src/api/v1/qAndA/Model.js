// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const qAndASchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    desc: { type: String, trim: true },
    courseId: { type: ObjectId, ref: "course", required: true },
    lectureId: { type: ObjectId, ref: "lecture", required: true },
    lectureNo: Number,
    comments: [
      {
        desc: String,
        updatedBy: { type: ObjectId, ref: "user", required: true },
        createdAt: Date,
        updatedAt: Date,
        votes: [],
      },
    ],
    votes: [],
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("q-and-a", qAndASchema);
