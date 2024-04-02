// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const quizSchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    desc: { type: String, trim: true },
    questions: [
      {
        title: String,
        options: [
          {
            index: Number,
            option: String,
            explain: String,
          },
        ],
        answer: [],
        score: Number,
        // 1: true/false, 2: multiple choise, 3: fill in the blank, 4: drop down, 5: shorting
        questionType: String,
      },
    ],
    courseId: { type: ObjectId, ref: "course", required: true },
    updatedBy: { type: ObjectId, ref: "user", required: true },
    updatedByAdmin: { type: ObjectId, ref: "user" },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedByAdmin: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("quiz", quizSchema);
