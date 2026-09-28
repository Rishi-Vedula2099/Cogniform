// =============================================================================
// Cogniform — Shared Utilities
// =============================================================================

import { type FieldType, type LogicAction, type LogicOperator } from "@cogniform/types";
import { nanoid } from "nanoid";
import { format, formatDistanceToNow } from "date-fns";

// ── ID Generation ────────────────────────────────────────────────────────────

export function createId(): string {
  return nanoid();
}

// ── Slug Generation ────────────────────────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateFormSlug(title: string): string {
  const base = generateSlug(title);
  const randomSuffix = nanoid(6);
  return `${base}-${randomSuffix}`;
}

// ── Date Utilities ───────────────────────────────────────────────────────────

export function formatDate(date: string | Date, pattern = "MMM d, yyyy"): string {
  return format(new Date(date), pattern);
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ── File Size Utilities ───────────────────────────────────────────────────────

const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${FILE_SIZE_UNITS[i]}`;
}

export function parseFileSize(size: string): number {
  const match = size.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return 0;
  const value = parseFloat(match[1] as string);
  const unit = (match[2] as string).toUpperCase() as (typeof FILE_SIZE_UNITS)[number];
  const index = FILE_SIZE_UNITS.indexOf(unit);
  return value * Math.pow(1024, index);
}

// ── Field Type Utilities ──────────────────────────────────────────────────────

export interface FieldTypeInfo {
  type: FieldType;
  label: string;
  icon: string;
  group: "basic" | "contact" | "advanced" | "layout";
  acceptsOptions: boolean;
  acceptsFile: boolean;
  acceptsNumber: boolean;
}

export const FIELD_TYPES: FieldTypeInfo[] = [
  { type: "TEXT", label: "Short Text", icon: "Type", group: "basic", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "EMAIL", label: "Email", icon: "Mail", group: "contact", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "PHONE", label: "Phone", icon: "Phone", group: "contact", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "NUMBER", label: "Number", icon: "Hash", group: "basic", acceptsOptions: false, acceptsFile: false, acceptsNumber: true },
  { type: "PASSWORD", label: "Password", icon: "KeyRound", group: "advanced", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "URL", label: "URL", icon: "Link", group: "contact", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "DATE", label: "Date", icon: "Calendar", group: "basic", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "TIME", label: "Time", icon: "Clock", group: "basic", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "CHECKBOX", label: "Checkboxes", icon: "CheckSquare", group: "basic", acceptsOptions: true, acceptsFile: false, acceptsNumber: false },
  { type: "RADIO", label: "Radio Buttons", icon: "CircleDot", group: "basic", acceptsOptions: true, acceptsFile: false, acceptsNumber: false },
  { type: "DROPDOWN", label: "Dropdown", icon: "ChevronDown", group: "basic", acceptsOptions: true, acceptsFile: false, acceptsNumber: false },
  { type: "FILE_UPLOAD", label: "File Upload", icon: "Upload", group: "advanced", acceptsOptions: false, acceptsFile: true, acceptsNumber: false },
  { type: "RATING", label: "Rating", icon: "Star", group: "advanced", acceptsOptions: false, acceptsFile: false, acceptsNumber: true },
  { type: "SIGNATURE", label: "Signature", icon: "PenTool", group: "advanced", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "ADDRESS", label: "Address", icon: "MapPin", group: "contact", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "COLOR_PICKER", label: "Color Picker", icon: "Palette", group: "advanced", acceptsOptions: false, acceptsFile: false, acceptsNumber: false },
  { type: "MATRIX", label: "Matrix", icon: "Grid3x3", group: "advanced", acceptsOptions: true, acceptsFile: false, acceptsNumber: false },
];

export function getFieldTypeInfo(type: FieldType): FieldTypeInfo {
  const info = FIELD_TYPES.find((f) => f.type === type);
  if (!info) throw new Error(`Unknown field type: ${type}`);
  return info;
}

export function getFieldGroups(): Record<string, FieldTypeInfo[]> {
  return FIELD_TYPES.reduce<Record<string, FieldTypeInfo[]>>((acc, field) => {
    const list = acc[field.group] || [];
    list.push(field);
    acc[field.group] = list;
    return acc;
  }, {});
}

// ── Logic Engine Utilities ──────────────────────────────────────────────────

export function evaluateCondition(
  fieldValue: unknown,
  operator: LogicOperator,
  compareValue?: string,
): boolean {
  const value = String(fieldValue ?? "").trim();
  const compare = compareValue?.trim() ?? "";

  switch (operator) {
    case "EQUALS":
      return value === compare;
    case "NOT_EQUALS":
      return value !== compare;
    case "CONTAINS":
      return value.includes(compare);
    case "NOT_CONTAINS":
      return !value.includes(compare);
    case "GREATER_THAN":
      return Number(value) > Number(compare);
    case "LESS_THAN":
      return Number(value) < Number(compare);
    case "GREATER_THAN_OR_EQUAL":
      return Number(value) >= Number(compare);
    case "LESS_THAN_OR_EQUAL":
      return Number(value) <= Number(compare);
    case "IS_EMPTY":
      return value === "";
    case "IS_NOT_EMPTY":
      return value !== "";
    case "STARTS_WITH":
      return value.startsWith(compare);
    case "ENDS_WITH":
      return value.endsWith(compare);
    default:
      return false;
  }
}

export function evaluateLogicRule(
  answers: Record<string, unknown>,
  conditions: { fieldId: string; operator: LogicOperator; value?: string }[],
  conjunction: "AND" | "OR",
): boolean {
  if (conditions.length === 0) return false;

  const results = conditions.map((condition) =>
    evaluateCondition(answers[condition.fieldId], condition.operator, condition.value),
  );

  return conjunction === "AND" ? results.every(Boolean) : results.some(Boolean);
}

// ── Validation Utilities ────────────────────────────────────────────────────

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[+]?[\d\s()-]{7,20}$/.test(phone);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ── Encryption Utilities ─────────────────────────────────────────────────────

export function maskSecret(secret: string, visibleChars = 4): string {
  if (secret.length <= visibleChars) return "****";
  return "*".repeat(secret.length - visibleChars) + secret.slice(-visibleChars);
}

// ── Number Utilities ────────────────────────────────────────────────────────

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function calculateConversionRate(responses: number, views: number): number {
  if (views === 0) return 0;
  return Math.round((responses / views) * 100 * 100) / 100;
}

// ── Class Name Utilities ────────────────────────────────────────────────────

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
