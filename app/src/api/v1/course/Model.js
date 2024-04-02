// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const courseSchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, required: true },
    subTitle: { type: String, trim: true },
    desc: { type: String, trim: true },
    language: { type: String, trim: true },
    level: { type: String, trim: true },
    categoryId: { type: ObjectId, ref: "category", required: true },
    subCategoryId: { type: ObjectId, ref: "sub-category", required: true },
    // 1 -> draft, 2 -> preview, 3 -> publish
    status: { type: Number, default: 1 },
    whatWillLearn: [],
    prerequisites: [],
    whoIsThisCourseFor: [],
    thumbnailId: { type: ObjectId, ref: "file" },
    promotionalVideoId: { type: ObjectId, ref: "file" },
    price: {
      currency: String,
      amount: Number,
    },
    paid: { type: Boolean, default: true },
    welcomeMsg: String,
    congratulationsMsg: String,
    sections: [
      {
        title: String,
        desc: String,
        items: [
          {
            // 1 -> lecture, 2 -> quiz, 3 -> assignment
            itemType: Number,
            lectureId: { type: ObjectId, ref: "lecture" },
            quizId: { type: ObjectId, ref: "quiz" },
            assignmentId: { type: ObjectId, ref: "assignment" },
          },
        ],
      },
    ],
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
module.exports = model("course", courseSchema);
