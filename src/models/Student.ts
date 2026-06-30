import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const profileSchema = new Schema(
  {
    avatar: { type: String, trim: true },
    bio: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const downloadSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
    downloadedAt: { type: Date, default: Date.now },
    count: { type: Number, default: 1 },
  },
  { _id: false }
);

const studentSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    accessCode: { type: String, trim: true },
    studentNumber: { type: String, trim: true },
    profile: { type: profileSchema, default: () => ({}) },
    downloads: { type: [downloadSchema], default: [] },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Document" }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export type StudentDoc = InferSchemaType<typeof studentSchema>;

export const Student =
  (models.Student as mongoose.Model<StudentDoc>) ||
  model<StudentDoc>("Student", studentSchema);
