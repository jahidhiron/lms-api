// lib
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const lectureSchema = Schema(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, required: true },
    preview: { type: Boolean, default: false },
    desc: { type: String, trim: true },
    videoId: { type: ObjectId, ref: "file" },
    resources: [
      {
        title: String,
        fileId: { type: ObjectId, ref: "file" },
        link: String,
      },
    ],
    cations: [
      {
        lang: String,
        fileId: { type: ObjectId, ref: "file" },
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
module.exports = model("lecture", lectureSchema);
