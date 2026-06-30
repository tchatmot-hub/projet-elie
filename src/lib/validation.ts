import { z } from "zod";

export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const passwordSchema = z
  .string()
  .regex(
    PASSWORD_REGEX,
    "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial."
  );

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Adresse e-mail invalide.");

export function isValidPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const colorSchema = z
  .string()
  .regex(HEX_COLOR, "Couleur hexadécimale invalide.");

export const registerSchoolSchema = z.object({
  name: z.string().trim().min(3, "Le nom de l'école doit faire au moins 3 caractères."),
  code: z
    .string()
    .trim()
    .min(2, "Le code de l'école est requis.")
    .max(16)
    .transform((v) => v.toUpperCase()),
  domain: z.string().trim().min(3).optional(),
  logo: z.string().trim().url().optional().or(z.literal("")),
  primaryColor: colorSchema.optional(),
  secondaryColor: colorSchema.optional(),
  adminName: z.string().trim().min(2, "Le nom de l'administrateur est requis."),
  adminEmail: emailSchema,
  adminPassword: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const registerStudentSchema = z.object({
  accessCode: z
    .string()
    .trim()
    .length(8, "Le code d'accès doit faire 8 caractères.")
    .transform((v) => v.toUpperCase()),
  name: z.string().trim().min(2, "Le nom est requis."),
  email: emailSchema,
  password: passwordSchema,
  studentNumber: z.string().trim().optional(),
});

export const createClassSchema = z.object({
  schoolId: z.string().min(1),
  name: z.string().trim().min(5, "Le nom de la classe doit faire au moins 5 caractères."),
  code: z.string().trim().min(2).transform((v) => v.toUpperCase()),
  academicYear: z.string().trim().min(4),
  level: z.string().trim().min(1),
  department: z.string().trim().optional(),
});

export const createDelegateSchema = z.object({
  schoolId: z.string().min(1),
  classId: z.string().min(1),
  name: z.string().trim().min(2),
  username: z.string().trim().min(3),
  email: emailSchema,
  password: passwordSchema,
});

export const createDocumentSchema = z.object({
  classId: z.string().min(1),
  title: z.string().trim().min(1, "Le titre est requis."),
  description: z.string().trim().optional(),
  subject: z.string().trim().min(1, "La matière est requise."),
  professor: z.string().trim().min(1, "Le professeur est requis."),
  type: z.enum(["course", "td", "tp", "exam", "correction"]),
  fileType: z.string().trim().min(1),
  fileUrl: z.string().trim().min(1),
  fileSize: z.number().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

export const createAnnouncementSchema = z.object({
  classId: z.string().min(1),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  isPinned: z.boolean().optional(),
  targetAudience: z.enum(["all", "students", "delegates"]).optional(),
});

const ACCESS_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generates an 8-character uppercase alphanumeric access code. */
export function generateAccessCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ACCESS_CODE_ALPHABET.charAt(
      Math.floor(Math.random() * ACCESS_CODE_ALPHABET.length)
    );
  }
  return code;
}
