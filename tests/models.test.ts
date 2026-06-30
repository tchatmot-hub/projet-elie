import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { School } from "@/models/School";
import { ClassModel } from "@/models/Class";
import { AccessCode } from "@/models/AccessCode";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all([
    School.init(),
    ClassModel.init(),
    AccessCode.init(),
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await Promise.all([
    School.deleteMany({}),
    ClassModel.deleteMany({}),
    AccessCode.deleteMany({}),
  ]);
});

describe("School model", () => {
  it("enforces a unique school code", async () => {
    await School.create({ name: "School One", code: "UCAO" });
    await expect(School.create({ name: "School Two", code: "UCAO" })).rejects.toThrow();
  });

  it("uppercases the code and applies default branding", async () => {
    const school = await School.create({ name: "Lowercase", code: "abc" });
    expect(school.code).toBe("ABC");
    expect(school.primaryColor).toBeTruthy();
    expect(school.settings?.allowStudentUpload).toBe(false);
  });
});

describe("Class model", () => {
  it("allows the same class code in different schools but not within one", async () => {
    const schoolA = new mongoose.Types.ObjectId();
    const schoolB = new mongoose.Types.ObjectId();
    const base = { name: "Licence 1 Info", code: "L1", academicYear: "2026-2027", level: "L1" };

    await ClassModel.create({ ...base, schoolId: schoolA });
    await ClassModel.create({ ...base, schoolId: schoolB });
    await expect(ClassModel.create({ ...base, schoolId: schoolA })).rejects.toThrow();
  });
});

describe("AccessCode model", () => {
  it("enforces unique code within a class", async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const createdBy = new mongoose.Types.ObjectId();
    await AccessCode.create({ schoolId, classId, code: "ABCDEFGH", createdBy });
    await expect(
      AccessCode.create({ schoolId, classId, code: "ABCDEFGH", createdBy })
    ).rejects.toThrow();
  });
});
