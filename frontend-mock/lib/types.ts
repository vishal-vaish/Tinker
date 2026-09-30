import type { LoginFormValues, SignUpFormValues, ForgotPasswordFormValues } from "./schemas";

// ============================================================================
// 1. Domain Entities
// ============================================================================

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role?: "user" | "admin" | "developer";
  createdAt?: string;
}

export interface UserSession extends UserEntity {
  token?: string;
}

export interface MetricItem {
  label: string;
  shortLabel?: string;
  value: string;
  change: string;
  accent: "violet" | "cyan" | "emerald" | "amber";
}

export interface HowItWorksStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  accent: "violet" | "cyan" | "emerald";
  details: string[];
  codeSnippet: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  iconName: "Terminal" | "Shield" | "Layers" | "Database" | "Crosshair" | "GitCompare";
  accent: "cyan" | "violet" | "emerald" | "amber" | "rose" | "indigo";
  bentoSpan?: string;
  highlightText?: string;
}

export interface FrameworkItem {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  runtimeSpeed: string;
  accentColor: string;
  features: string[];
}

export interface TestimonialItem {
  name: string;
  role: string;
  company: string;
  avatarText: string;
  content: string;
  rating: number;
  highlightBadge: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FileTreeItem {
  name: string;
  type: "file" | "folder";
  extension?: "tsx" | "ts" | "css" | "json" | "sql";
  active?: boolean;
}

export interface NavLinkItem {
  label: string;
  href: string;
  hasArrow?: boolean;
}

// ============================================================================
// 2. Request Types
// ============================================================================

export type LoginRequest = LoginFormValues;

export type RegisterRequest = SignUpFormValues;

export type ForgotPasswordRequest = ForgotPasswordFormValues;

export interface OAuthLoginRequest {
  provider: "github" | "google" | string;
}

// ============================================================================
// 3. Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export type AuthResponse<T = UserSession> = ApiResponse<T>;

export type OAuthLoginResponse = ApiResponse<{
  redirectUrl: string;
}>;

export type LogoutResponse = ApiResponse<null>;
