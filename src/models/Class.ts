import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const classSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
  },
  { timestamps: true }
);

// A class code is unique within a school.
classSchema.index({ schoolId: 1, code: 1 }, { unique: true });

export type ClassDoc = InferSchemaType<typeof classSchema>;

export const ClassModel =
  (models.Class as mongoose.Model<ClassDoc>) ||
  model<ClassDoc>("Class", classSchema);
