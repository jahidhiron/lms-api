// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const quizAnswerSchema = Schema(
  {
    quizId: { type: ObjectId, ref: "quiz", required: true },
    answer: [
      {
        question: String,
        match: Boolean,
        options: [
          {
            index: Number,
            option: String,
            explain: String,
          },
        ],
        correctAnswer: [],
        answerProvided: [],
        questionType: String,
      },
    ],
    oldAnswer: [],
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("quizanswer", quizAnswerSchema);
