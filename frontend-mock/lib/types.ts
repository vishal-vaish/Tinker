import type {
  LoginFormValues,
  SignUpFormValues,
  ForgotPasswordFormValues,
  CreateWorkspaceFormValues,
} from "./schemas";

// ============================================================================
// 1. Domain Entities
// ============================================================================

export interface UserEntity {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatarUrl?: string;
  role?: "user" | "admin" | "developer";
  plan: "free" | "pro";
  tokensAvailable?: number; // Computed dynamically from token_transactions ledger
  createdAt: string;
  updatedAt?: string;
}

export interface UserSession extends UserEntity {
  token?: string;
}

export interface TokenTransactionEntity {
  id: string;
  userId: string;
  amount: number;
  type: "PURCHASE" | "USAGE" | "GRANT" | "REFUND";
  stripePaymentId?: string;
  pricePaidUsd?: number;
  balanceAfter: number;
  createdBy: string;
  createdAt: string;
}

export interface WorkspaceEntity {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  memberCount?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMemberEntity {
  id: string;
  workspaceId: string;
  userId: string;
  role: "admin" | "member" | "viewer";
  joinedAt: string;
  createdAt: string;
}

export interface ProjectEntity {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  framework: "nextjs" | "vite" | "fastify" | "remix";
  status: "active" | "ready" | "building" | "archived";
  visibility: "private" | "public";
  branch?: string;
  starsCount?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftEntity {
  id: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  description?: string;
  framework: "nextjs" | "vite" | "fastify" | "remix";
  modelUsed: string;
  isPinned: boolean;
  status: "idle" | "generating" | "ready" | "error";
  promptsCount: number;
  previewUrl?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftMessageEntity {
  id: string;
  draftId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokensUsed: number;
  toolCalls?: Record<string, unknown>[];
  createdAt: string;
}

export interface AuditLogEntity {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  createdAt: string;
  // Backward compatibility fields
  timestamp?: string;
  severity?: "info" | "warning" | "critical";
  workspaceId?: string;
  actor?: string;
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

export type CreateWorkspaceRequest = CreateWorkspaceFormValues;

export interface CreateDraftRequest {
  workspaceId: string;
  title: string;
  prompt: string;
  framework?: "nextjs" | "vite" | "fastify" | "remix";
  modelUsed?: string;
}

export interface CreateProjectRequest {
  workspaceId: string;
  name: string;
  description?: string;
  framework: "nextjs" | "vite" | "fastify" | "remix";
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

export type WorkspacesResponse = ApiResponse<WorkspaceEntity[]>;

export type ProjectsResponse = ApiResponse<ProjectEntity[]>;

export type DraftsResponse = ApiResponse<DraftEntity[]>;

export type DraftDetailResponse = ApiResponse<DraftEntity>;

export type TokenTransactionsResponse = ApiResponse<TokenTransactionEntity[]>;

export type WorkspaceMembersResponse = ApiResponse<WorkspaceMemberEntity[]>;

export type DraftMessagesResponse = ApiResponse<DraftMessageEntity[]>;

export type AuditLogsResponse = ApiResponse<AuditLogEntity[]>;
