// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const enrollmentSchema = Schema(
  {
    courseId: { type: ObjectId, ref: "course", required: true },
    paymentId: { type: ObjectId },
    complete: [
      {
        lectureId: { type: ObjectId, ref: "lecture" },
        completedAt: Date,
        // todo
        notes: [
          {
            title: String,
            desc: String,
            createdAt: Date,
            updatedAt: Date,
          },
        ],
      },
    ],
    lastLectureCompleted: { type: ObjectId, ref: "lecture" },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("enrollment", enrollmentSchema);
