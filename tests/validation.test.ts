import {
  isValidPassword,
  isValidEmail,
  generateAccessCode,
  registerSchoolSchema,
  registerStudentSchema,
  createClassSchema,
} from "@/lib/validation";

describe("password policy", () => {
  it("accepts strong passwords", () => {
    expect(isValidPassword("Abcdef1@")).toBe(true);
    expect(isValidPassword("Str0ng!Pass")).toBe(true);
  });

  it("rejects weak passwords", () => {
    expect(isValidPassword("short1!")).toBe(false); // too short
    expect(isValidPassword("alllowercase1!")).toBe(false); // no uppercase
    expect(isValidPassword("NoDigits!!")).toBe(false); // no digit
    expect(isValidPassword("NoSpecial1")).toBe(false); // no special
  });
});

describe("email validation", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("first.last@school.edu")).toBe(true);
  });
  it("rejects invalid emails", () => {
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("access code generation", () => {
  it("produces 8-char uppercase alphanumeric codes", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateAccessCode();
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
    }
  });
  it("respects custom length", () => {
    expect(generateAccessCode(12)).toHaveLength(12);
  });
});

describe("schema parsing", () => {
  it("uppercases and validates school code", () => {
    const parsed = registerSchoolSchema.safeParse({
      name: "Demo School",
      code: "ucao",
      adminName: "Admin",
      adminEmail: "admin@demo.edu",
      adminPassword: "Abcdef1@",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.code).toBe("UCAO");
  });

  it("rejects a too-short school name", () => {
    const parsed = registerSchoolSchema.safeParse({
      name: "AB",
      code: "X1",
      adminName: "Admin",
      adminEmail: "admin@demo.edu",
      adminPassword: "Abcdef1@",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an access code of the wrong length", () => {
    const parsed = registerStudentSchema.safeParse({
      accessCode: "ABC",
      name: "Jane",
      email: "jane@demo.edu",
      password: "Abcdef1@",
    });
    expect(parsed.success).toBe(false);
  });

  it("requires a class name of at least 5 characters", () => {
    const parsed = createClassSchema.safeParse({
      schoolId: "x",
      name: "L1",
      code: "c1",
      academicYear: "2026",
      level: "L1",
    });
    expect(parsed.success).toBe(false);
  });
});
