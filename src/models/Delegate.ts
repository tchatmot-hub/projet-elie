import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const permissionsSchema = new Schema(
  {
    canUpload: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: true },
    canManageStudents: { type: Boolean, default: true },
    canGenerateCodes: { type: Boolean, default: true },
    canPublishAnnouncements: { type: Boolean, default: true },
  },
  { _id: false }
);

const delegateSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    // School admins are not bound to a specific class.
    classId: { type: Schema.Types.ObjectId, ref: "Class", index: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["delegate", "school_admin", "superadmin"],
      default: "delegate",
      index: true,
    },
    permissions: { type: permissionsSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export type DelegateDoc = InferSchemaType<typeof delegateSchema>;

export const Delegate =
  (models.Delegate as mongoose.Model<DelegateDoc>) ||
  model<DelegateDoc>("Delegate", delegateSchema);
