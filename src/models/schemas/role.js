import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      enum: ["admin", "user"],
    },
  },
  {
    timestamps: true,
  },
);

export default roleSchema;
