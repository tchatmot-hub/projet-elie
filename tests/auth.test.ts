process.env.JWT_SECRET = "test-secret";

import { hashPassword, verifyPassword, signToken, verifyToken } from "@/lib/auth";
import type { AuthUser } from "@/types";

const user: AuthUser = {
  id: "abc123",
  role: "delegate",
  schoolId: "school1",
  classId: "class1",
  email: "d@demo.edu",
  name: "Delegate",
};

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("Abcdef1@");
    expect(hash).not.toBe("Abcdef1@");
    expect(await verifyPassword("Abcdef1@", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("jwt", () => {
  it("signs and verifies a token round-trip", () => {
    const token = signToken(user);
    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.id).toBe(user.id);
    expect(payload?.role).toBe("delegate");
    expect(payload?.schoolId).toBe("school1");
  });

  it("returns null for an invalid token", () => {
    expect(verifyToken("not-a-token")).toBeNull();
  });

  it("returns null for a token signed with another secret", () => {
    const token = signToken(user);
    process.env.JWT_SECRET = "different-secret";
    const payload = verifyToken(token);
    process.env.JWT_SECRET = "test-secret";
    expect(payload).toBeNull();
  });
});
