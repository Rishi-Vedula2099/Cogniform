// =============================================================================
// Cogniform — Shared Zod Validation Schemas
// =============================================================================

import { z } from "zod";

// ── Common Schemas ───────────────────────────────────────────────────────────

export const cuidSchema = z.string().cuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

// ── User Schemas ────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ── Workspace Schemas ────────────────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  logo: z.string().url().optional().or(z.literal("")),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]),
});

// ── Form Schemas ────────────────────────────────────────────────────────────

export const fieldSettingsSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  multiple: z.boolean().optional(),
  accept: z.array(z.string()).optional(),
  maxSize: z.number().optional(),
  minRating: z.number().min(1).max(10).optional(),
  maxRating: z.number().min(1).max(10).optional(),
  format: z.string().optional(),
  rows: z.number().int().min(1).max(50).optional(),
  columns: z.array(z.string()).optional(),
  rowsLabels: z.array(z.string()).optional(),
  pattern: z.string().optional(),
});

export const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  value: z.string(),
  isDefault: z.boolean().optional(),
});

export const fieldValidationSchema = z.object({
  type: z.enum([
    "REQUIRED",
    "MIN_LENGTH",
    "MAX_LENGTH",
    "MIN_VALUE",
    "MAX_VALUE",
    "REGEX",
    "EMAIL_FORMAT",
    "PHONE_FORMAT",
    "URL_FORMAT",
    "CUSTOM",
  ]),
  value: z.string().optional(),
  message: z.string().min(1),
});

export const logicConditionSchema = z.object({
  fieldId: cuidSchema,
  operator: z.enum([
    "EQUALS",
    "NOT_EQUALS",
    "CONTAINS",
    "NOT_CONTAINS",
    "GREATER_THAN",
    "LESS_THAN",
    "GREATER_THAN_OR_EQUAL",
    "LESS_THAN_OR_EQUAL",
    "IS_EMPTY",
    "IS_NOT_EMPTY",
    "STARTS_WITH",
    "ENDS_WITH",
  ]),
  value: z.string().optional(),
});

export const logicRuleSchema = z.object({
  id: cuidSchema,
  action: z.enum(["SHOW", "HIDE", "REQUIRE", "DISABLE", "SET_VALUE"]),
  conditions: z.array(logicConditionSchema).min(1),
  conjunction: z.enum(["AND", "OR"]).default("AND"),
  targetFieldId: cuidSchema.optional(),
  value: z.string().optional(),
});

export const formFieldSchema = z.object({
  id: cuidSchema,
  sectionId: cuidSchema,
  type: z.enum([
    "TEXT",
    "EMAIL",
    "PHONE",
    "CHECKBOX",
    "RADIO",
    "DROPDOWN",
    "DATE",
    "TIME",
    "FILE_UPLOAD",
    "RATING",
    "SIGNATURE",
    "ADDRESS",
    "NUMBER",
    "PASSWORD",
    "URL",
    "COLOR_PICKER",
    "MATRIX",
  ]),
  label: z.string().min(1, "Label is required"),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean().default(false),
  defaultValue: z.string().optional(),
  order: z.number().int().min(0),
  width: z.number().int().min(10).max(100).default(100),
  options: z.array(fieldOptionSchema).optional(),
  settings: fieldSettingsSchema.optional(),
  isConditional: z.boolean().default(false),
  validations: z.array(fieldValidationSchema).optional(),
  logicRules: z.array(logicRuleSchema).optional(),
});

export const formSectionSchema = z.object({
  id: cuidSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().min(0),
  isConditional: z.boolean().default(false),
  fields: z.array(formFieldSchema).default([]),
});

export const createFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  sections: z.array(formSectionSchema).default([]),
});

export const updateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "CLOSED"]).optional(),
  password: z.string().optional().or(z.literal("")),
  captchaEnabled: z.boolean().optional(),
  allowEmbed: z.boolean().optional(),
  customDomain: z.string().optional().or(z.literal("")),
  sections: z.array(formSectionSchema).optional(),
});

export const publishFormSchema = z.object({
  formId: cuidSchema,
});

// ── Response Schemas ────────────────────────────────────────────────────────

export const responseAnswerSchema = z.object({
  fieldId: cuidSchema,
  value: z.unknown().optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().int().nonnegative().optional(),
});

export const submitResponseSchema = z.object({
  formSlug: z.string().min(1),
  formPassword: z.string().optional(),
  captchaToken: z.string().optional(),
  answers: z.array(responseAnswerSchema),
  metadata: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_term: z.string().optional(),
      utm_content: z.string().optional(),
      referrer: z.string().optional(),
    })
    .optional(),
});

// ── Integration Schemas ──────────────────────────────────────────────────────

export const createWebhookSchema = z.object({
  url: z.string().url("Invalid URL"),
  events: z.array(
    z.enum([
      "FORM_SUBMITTED",
      "FORM_UPDATED",
      "FORM_DELETED",
      "FORM_PUBLISHED",
      "MEMBER_INVITED",
      "MEMBER_REMOVED",
    ]),
  ).min(1),
  formId: cuidSchema.optional(),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z
    .array(
      z.enum([
        "FORM_SUBMITTED",
        "FORM_UPDATED",
        "FORM_DELETED",
        "FORM_PUBLISHED",
        "MEMBER_INVITED",
        "MEMBER_REMOVED",
      ]),
    )
    .optional(),
  isEnabled: z.boolean().optional(),
});

// ── Export Schemas ──────────────────────────────────────────────────────────

export const exportResponsesSchema = z.object({
  format: z.enum(["csv", "excel", "pdf"]),
  formId: cuidSchema,
  filters: z
    .object({
      fromDate: z.string().datetime().optional(),
      toDate: z.string().datetime().optional(),
      isCompleted: z.boolean().optional(),
      search: z.string().optional(),
    })
    .optional(),
});
