import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const schoolSettingsSchema = new Schema(
  {
    maxDelegatesPerClass: { type: Number, default: 3 },
    maxStudentsPerClass: { type: Number, default: 200 },
    allowStudentUpload: { type: Boolean, default: false },
    requireEmailVerification: { type: Boolean, default: false },
  },
  { _id: false }
);

const schoolSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    domain: { type: String, trim: true },
    logo: { type: String, trim: true },
    primaryColor: { type: String, default: "#1d4ed8" },
    secondaryColor: { type: String, default: "#1e293b" },
    isActive: { type: Boolean, default: true },
    settings: { type: schoolSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

schoolSchema.index({ name: 1 });

export type SchoolDoc = InferSchemaType<typeof schoolSchema>;

export const School =
  (models.School as mongoose.Model<SchoolDoc>) ||
  model<SchoolDoc>("School", schoolSchema);
