// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const announcementSchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    desc: { type: String, trim: true },
    courseId: { type: ObjectId, ref: "course", required: true },
    comments: [
      Schema(
        {
          title: String,
          updatedBy: { type: ObjectId, ref: "user", required: true },
        },
        { timestamps: true }
      ),
    ],
    updatedBy: { type: ObjectId, ref: "user", required: true },
    isDelete: { type: Boolean, default: false },
    deletedBy: { type: ObjectId, ref: "user" },
    deletedAt: Date,
  },
  { timestamps: true }
);

// reference
module.exports = model("announcement", announcementSchema);
