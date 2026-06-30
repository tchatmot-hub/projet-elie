import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const documentSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Delegate", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    professor: { type: String, trim: true },
    type: {
      type: String,
      enum: ["course", "td", "tp", "exam", "correction"],
      default: "course",
      index: true,
    },
    fileType: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    isPublic: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

documentSchema.index({ title: "text", subject: "text", professor: "text" });

export type DocumentDoc = InferSchemaType<typeof documentSchema>;

export const DocumentModel =
  (models.Document as mongoose.Model<DocumentDoc>) ||
  model<DocumentDoc>("Document", documentSchema);
