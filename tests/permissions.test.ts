import { hasPermission, permissionsForRole } from "@/lib/permissions";

describe("permission matrix", () => {
  it("only superadmin can create/delete schools", () => {
    expect(hasPermission("superadmin", "school:create")).toBe(true);
    expect(hasPermission("superadmin", "school:delete")).toBe(true);
    for (const role of ["school_admin", "delegate", "student"] as const) {
      expect(hasPermission(role, "school:create")).toBe(false);
      expect(hasPermission(role, "school:delete")).toBe(false);
    }
  });

  it("delegates and admins can upload/delete documents, students cannot", () => {
    for (const role of ["superadmin", "school_admin", "delegate"] as const) {
      expect(hasPermission(role, "document:upload")).toBe(true);
      expect(hasPermission(role, "document:delete")).toBe(true);
    }
    expect(hasPermission("student", "document:upload")).toBe(false);
    expect(hasPermission("student", "document:delete")).toBe(false);
  });

  it("everyone can download documents and view announcements", () => {
    for (const role of ["superadmin", "school_admin", "delegate", "student"] as const) {
      expect(hasPermission(role, "document:download")).toBe(true);
      expect(hasPermission(role, "announcement:view")).toBe(true);
      expect(hasPermission(role, "profile:update")).toBe(true);
    }
  });

  it("only admins manage classes; delegates do not", () => {
    expect(hasPermission("superadmin", "class:manage")).toBe(true);
    expect(hasPermission("school_admin", "class:manage")).toBe(true);
    expect(hasPermission("delegate", "class:manage")).toBe(false);
    expect(hasPermission("student", "class:manage")).toBe(false);
  });

  it("only superadmin sees system stats", () => {
    expect(hasPermission("superadmin", "stats:system")).toBe(true);
    expect(hasPermission("school_admin", "stats:system")).toBe(false);
  });

  it("returns a copy of the role permissions", () => {
    const perms = permissionsForRole("student");
    expect(perms).toContain("document:download");
    perms.push("school:create");
    expect(permissionsForRole("student")).not.toContain("school:create");
  });
});
