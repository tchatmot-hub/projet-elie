import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const announcementSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "Delegate", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    isPinned: { type: Boolean, default: false },
    targetAudience: {
      type: String,
      enum: ["all", "students", "delegates"],
      default: "all",
    },
    readBy: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

export type AnnouncementDoc = InferSchemaType<typeof announcementSchema>;

export const Announcement =
  (models.Announcement as mongoose.Model<AnnouncementDoc>) ||
  model<AnnouncementDoc>("Announcement", announcementSchema);
