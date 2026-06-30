/**
 * Seeds the database with a bootstrap superadmin and demo data.
 * Run with: npm run seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";
import { generateAccessCode } from "../src/lib/validation";
import { School } from "../src/models/School";
import { ClassModel } from "../src/models/Class";
import { Delegate } from "../src/models/Delegate";
import { Student } from "../src/models/Student";
import { DocumentModel } from "../src/models/Document";
import { Announcement } from "../src/models/Announcement";
import { AccessCode } from "../src/models/AccessCode";

async function main() {
  await connectToDatabase();
  console.log("Connected. Clearing existing data…");

  await Promise.all([
    School.deleteMany({}),
    ClassModel.deleteMany({}),
    Delegate.deleteMany({}),
    Student.deleteMany({}),
    DocumentModel.deleteMany({}),
    Announcement.deleteMany({}),
    AccessCode.deleteMany({}),
  ]);

  const superEmail = process.env.SUPERADMIN_EMAIL || "superadmin@portailcours.edu";
  const superPass = process.env.SUPERADMIN_PASSWORD || "Admin@1234";

  const superadmin = await Delegate.create({
    schoolId: new mongoose.Types.ObjectId(),
    name: "Super Admin",
    username: "superadmin",
    email: superEmail,
    password: await hashPassword(superPass),
    role: "superadmin",
  });
  console.log(`Superadmin: ${superEmail} / ${superPass}`);

  const school = await School.create({
    name: "Université Catholique de l'Afrique de l'Ouest",
    code: "UCAO",
    domain: "ucao.portailcours.edu",
    primaryColor: "#1d4ed8",
    secondaryColor: "#1e293b",
  });

  await Delegate.create({
    schoolId: school._id,
    name: "Admin UCAO",
    username: "admin.ucao",
    email: "admin@ucao.edu",
    password: await hashPassword("Admin@1234"),
    role: "school_admin",
  });
  console.log("School admin: admin@ucao.edu / Admin@1234");

  const klass = await ClassModel.create({
    schoolId: school._id,
    name: "Licence 1 Informatique Groupe A",
    code: "L1-INFO-A",
    academicYear: "2026-2027",
    level: "L1",
    department: "Informatique",
  });

  const delegate = await Delegate.create({
    schoolId: school._id,
    classId: klass._id,
    name: "Élie Délégué",
    username: "elie.delegue",
    email: "delegue@ucao.edu",
    password: await hashPassword("Admin@1234"),
    role: "delegate",
  });
  console.log("Delegate: delegue@ucao.edu / Admin@1234");

  const codes = [];
  for (let i = 0; i < 5; i++) {
    codes.push(
      await AccessCode.create({
        schoolId: school._id,
        classId: klass._id,
        code: generateAccessCode(),
        createdBy: delegate._id,
      })
    );
  }
  console.log("Access codes:", codes.map((c) => c.code).join(", "));

  const usedCode = codes[0];
  const student = await Student.create({
    schoolId: school._id,
    classId: klass._id,
    name: "Étudiant Démo",
    email: "etudiant@ucao.edu",
    password: await hashPassword("Admin@1234"),
    accessCode: usedCode.code,
    studentNumber: "INF-2026-001",
  });
  usedCode.isUsed = true;
  usedCode.usedBy = student._id;
  await usedCode.save();
  console.log("Student: etudiant@ucao.edu / Admin@1234");

  await DocumentModel.create([
    {
      schoolId: school._id,
      classId: klass._id,
      uploadedBy: delegate._id,
      title: "Introduction à l'algorithmique",
      subject: "Algorithmique",
      professor: "Dr. Koffi",
      type: "course",
      fileType: "pdf",
      fileUrl: "/uploads/demo-algo.pdf",
      fileSize: 102400,
    },
    {
      schoolId: school._id,
      classId: klass._id,
      uploadedBy: delegate._id,
      title: "TD 1 - Structures de données",
      subject: "Structures de données",
      professor: "Dr. Mensah",
      type: "td",
      fileType: "pdf",
      fileUrl: "/uploads/demo-td1.pdf",
      fileSize: 51200,
    },
  ]);

  await Announcement.create({
    schoolId: school._id,
    classId: klass._id,
    authorId: delegate._id,
    title: "Bienvenue sur le portail",
    content: "Les supports de cours seront déposés ici chaque semaine.",
    priority: "high",
    isPinned: true,
  });

  console.log("Seed complete.");
  await mongoose.disconnect();
  void superadmin;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
