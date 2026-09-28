// =============================================================================
// Cogniform — Shared Type Definitions
// =============================================================================

// ── Enums ────────────────────────────────────────────────────────────────────

export type Role = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export type FieldType =
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "CHECKBOX"
  | "RADIO"
  | "DROPDOWN"
  | "DATE"
  | "TIME"
  | "FILE_UPLOAD"
  | "RATING"
  | "SIGNATURE"
  | "ADDRESS"
  | "NUMBER"
  | "PASSWORD"
  | "URL"
  | "COLOR_PICKER"
  | "MATRIX";

export type ValidationType =
  | "REQUIRED"
  | "MIN_LENGTH"
  | "MAX_LENGTH"
  | "MIN_VALUE"
  | "MAX_VALUE"
  | "REGEX"
  | "EMAIL_FORMAT"
  | "PHONE_FORMAT"
  | "URL_FORMAT"
  | "CUSTOM";

export type LogicOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_THAN_OR_EQUAL"
  | "LESS_THAN_OR_EQUAL"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY"
  | "STARTS_WITH"
  | "ENDS_WITH";

export type LogicAction = "SHOW" | "HIDE" | "REQUIRE" | "DISABLE" | "SET_VALUE";

export type IntegrationType =
  | "SLACK"
  | "DISCORD"
  | "GMAIL"
  | "GOOGLE_SHEETS"
  | "NOTION"
  | "WEBHOOK"
  | "ZAPIER"
  | "MAKE";

export type WebhookEvent =
  | "FORM_SUBMITTED"
  | "FORM_UPDATED"
  | "FORM_DELETED"
  | "FORM_PUBLISHED"
  | "MEMBER_INVITED"
  | "MEMBER_REMOVED";

export type FormStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "CLOSED";

export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "INVITE"
  | "REVOKE"
  | "PUBLISH"
  | "ARCHIVE"
  | "EXPORT";

// ── Form Builder Types ───────────────────────────────────────────────────────

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  isDefault?: boolean;
}

export interface FieldSettings {
  min?: number;
  max?: number;
  step?: number;
  multiple?: boolean;
  accept?: string[];
  maxSize?: number;
  minRating?: number;
  maxRating?: number;
  format?: string;
  rows?: number;
  columns?: string[];
  rowsLabels?: string[];
  pattern?: string;
  placeholder?: string;
}

export interface FieldValidationRule {
  type: ValidationType;
  value?: string;
  message: string;
}

export interface LogicCondition {
  fieldId: string;
  operator: LogicOperator;
  value?: string;
}

export interface LogicRule {
  id: string;
  action: LogicAction;
  conditions: LogicCondition[];
  conjunction: "AND" | "OR";
  targetFieldId?: string;
  value?: string;
}

export interface FormFieldSchema {
  id: string;
  sectionId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  defaultValue?: string;
  order: number;
  width: number;
  options?: FieldOption[];
  settings?: FieldSettings;
  isConditional: boolean;
  validations?: FieldValidationRule[];
  logicRules?: LogicRule[];
}

export interface FormSectionSchema {
  id: string;
  title?: string;
  description?: string;
  order: number;
  isConditional: boolean;
  fields: FormFieldSchema[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  sections: FormSectionSchema[];
}

// ── API Types ───────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ── User Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  memberCount: number;
  formCount: number;
  userRole?: Role;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: Role;
  user: Pick<User, "id" | "name" | "email" | "image">;
  invitedAt: string;
  acceptedAt?: string;
}

// ── Response Types ───────────────────────────────────────────────────────────

export interface ResponseAnswer {
  fieldId: string;
  value: unknown;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: ResponseAnswer[];
  isCompleted: boolean;
  duration?: number;
  startedAt: string;
  completedAt?: string;
  device?: DeviceInfo;
  browser?: BrowserInfo;
  geoLocation?: GeoLocation;
}

export interface DeviceInfo {
  type: "mobile" | "desktop" | "tablet";
  brand?: string;
  model?: string;
  os?: string;
}

export interface BrowserInfo {
  name: string;
  version?: string;
  engine?: string;
}

export interface GeoLocation {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

// ── Analytics Types ──────────────────────────────────────────────────────────

export interface FormAnalytics {
  id: string;
  formId: string;
  date: string;
  views: number;
  responses: number;
  completions: number;
  conversionRate: number;
  dropoffs: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  countries: Record<string, number>;
}

export interface FormOverview {
  totalViews: number;
  totalResponses: number;
  totalCompletions: number;
  conversionRate: number;
  averageDuration: number;
}

// ── Integration Types ─────────────────────────────────────────────────────────

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  isEnabled: boolean;
  formId?: string;
  lastTriggeredAt?: string;
  successCount: number;
  failureCount: number;
}

// ── Notification Types ───────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ── Audit Log Types ─────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
  user?: Pick<User, "id" | "name" | "email">;
}

// ── Form Version Types ──────────────────────────────────────────────────────

export interface FormVersion {
  id: string;
  version: number;
  schema: FormSchema;
  changeLog?: string;
  createdBy: string;
  createdAt: string;
}
