// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const assignmentSchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    desc: { type: String, trim: true },
    duration: Number,
    instructionVideoId: { type: ObjectId, ref: "file" },
    instructionDesc: { type: String, trim: true },
    instructionFileId: { type: ObjectId, ref: "file" },
    solutionVideoId: { type: ObjectId, ref: "file" },
    solutionFileId: { type: ObjectId, ref: "file" },
    questions: [
      {
        title: String,
        correctAnswer: String,
      },
    ],
    courseId: { type: ObjectId, ref: "course", required: true },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("assignment", assignmentSchema);
