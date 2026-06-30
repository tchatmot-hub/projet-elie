export type Role = "superadmin" | "school_admin" | "delegate" | "student";

export type DocumentType =
  | "course"
  | "td"
  | "tp"
  | "exam"
  | "correction";

export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";

export type TargetAudience = "all" | "students" | "delegates";

export interface AuthUser {
  id: string;
  role: Role;
  schoolId: string | null;
  classId: string | null;
  email: string;
  name: string;
}

export interface JwtPayload extends AuthUser {
  iat?: number;
  exp?: number;
}
