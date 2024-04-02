// pre-defined module
const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

// schema
const userSchema = Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true, min: 6, max: 64 },
    role: { type: Number, default: 1 },
    resetPassword: {
      email: {
        verifyCode: [
          {
            code: String,
            createdAt: Date,
            expireAt: Date,
            verifiedAt: Date,
            resetAt: Date,
            ip: String,
            used: { type: Boolean, default: false },
          },
        ],
      },
    },
    verified: {
      email: {
        status: { type: Boolean, default: false },
        verifiedAt: Date,
        verifyCode: [
          {
            code: String,
            createdAt: Date,
            expireAt: Date,
            verifiedAt: Date,
            ip: String,
            used: { type: Boolean, default: false },
          },
        ],
      },
    },
    avatarId: { type: ObjectId, ref: "file" },
    profileId: { type: ObjectId, ref: "profile" },
    lastLogin: { type: Date },
    isDelete: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: ObjectId, ref: "user" },
  },
  { timestamps: true }
);

// reference
module.exports = model("user", userSchema);
