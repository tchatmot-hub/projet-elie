import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const accessCodeSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Delegate", required: true },
    usedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// An access code is unique within a class.
accessCodeSchema.index({ classId: 1, code: 1 }, { unique: true });

export type AccessCodeDoc = InferSchemaType<typeof accessCodeSchema>;

export const AccessCode =
  (models.AccessCode as mongoose.Model<AccessCodeDoc>) ||
  model<AccessCodeDoc>("AccessCode", accessCodeSchema);
