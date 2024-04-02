// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const assignmentAnswerSchema = Schema(
  {
    assignmentId: { type: ObjectId, ref: "assignment", required: true },
    answers: [
      {
        title: String,
        correctAnswer: String,
        answerProvided: String,
      },
    ],
    // 1: draft, 2: submit
    status: { type: Number, default: 1 },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("assignmentanswer", assignmentAnswerSchema);
