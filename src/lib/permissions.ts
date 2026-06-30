import type { Role } from "@/types";

export type Permission =
  | "school:create"
  | "school:delete"
  | "school:update"
  | "class:manage"
  | "delegate:manage"
  | "document:upload"
  | "document:delete"
  | "code:generate"
  | "stats:class"
  | "stats:school"
  | "stats:system"
  | "document:download"
  | "announcement:view"
  | "announcement:manage"
  | "profile:update"
  | "student:manage";

/**
 * Permission matrix mirroring the role specification. A permission granted to a
 * role applies within that role's own scope (school / class); scope enforcement
 * is handled separately by the API handlers using the authenticated user.
 */
const MATRIX: Record<Role, Permission[]> = {
  superadmin: [
    "school:create",
    "school:delete",
    "school:update",
    "class:manage",
    "delegate:manage",
    "document:upload",
    "document:delete",
    "code:generate",
    "stats:class",
    "stats:school",
    "stats:system",
    "document:download",
    "announcement:view",
    "announcement:manage",
    "profile:update",
    "student:manage",
  ],
  school_admin: [
    "school:update",
    "class:manage",
    "delegate:manage",
    "document:upload",
    "document:delete",
    "code:generate",
    "stats:class",
    "stats:school",
    "document:download",
    "announcement:view",
    "announcement:manage",
    "profile:update",
    "student:manage",
  ],
  delegate: [
    "document:upload",
    "document:delete",
    "code:generate",
    "stats:class",
    "document:download",
    "announcement:view",
    "announcement:manage",
    "profile:update",
    "student:manage",
  ],
  student: [
    "document:download",
    "announcement:view",
    "profile:update",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}

export function permissionsForRole(role: Role): Permission[] {
  return [...(MATRIX[role] ?? [])];
}
