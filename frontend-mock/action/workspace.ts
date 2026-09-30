import type {
  WorkspaceEntity,
  WorkspaceMemberEntity,
  ProjectEntity,
  DraftEntity,
  DraftMessageEntity,
  UserEntity,
  TokenTransactionEntity,
  AuditLogEntity,
  WorkspacesResponse,
  WorkspaceMembersResponse,
  ProjectsResponse,
  DraftsResponse,
  DraftMessagesResponse,
  DraftDetailResponse,
  TokenTransactionsResponse,
  AuditLogsResponse,
  CreateWorkspaceRequest,
  ApiResponse,
} from "@/lib/types";

// Import seeded JSON data directly
import workspacesSeed from "@/data/db/workspaces.json";
import draftsSeed from "@/data/db/drafts.json";
import projectsSeed from "@/data/db/projects.json";
import usersSeed from "@/data/db/users.json";
import tokenTransactionsSeed from "@/data/db/token-transactions.json";
import workspaceMembersSeed from "@/data/db/workspace-members.json";
import draftMessagesSeed from "@/data/db/draft-messages.json";
import auditLogsSeed from "@/data/db/audit-logs.json";

// In-memory working copies for active session persistence
let workspacesState: WorkspaceEntity[] = [...(workspacesSeed as WorkspaceEntity[])];
let draftsState: DraftEntity[] = [...(draftsSeed as DraftEntity[])];
let projectsState: ProjectEntity[] = [...(projectsSeed as ProjectEntity[])];
let userState: UserEntity = { ...(usersSeed[0] as UserEntity) };
let tokenTransactionsState: TokenTransactionEntity[] = [
  ...(tokenTransactionsSeed as TokenTransactionEntity[]),
];
let workspaceMembersState: WorkspaceMemberEntity[] = [
  ...(workspaceMembersSeed as WorkspaceMemberEntity[]),
];
let draftMessagesState: DraftMessageEntity[] = [
  ...(draftMessagesSeed as DraftMessageEntity[]),
];
let auditLogsState: AuditLogEntity[] = [...(auditLogsSeed as AuditLogEntity[])];

/**
 * Compute the dynamic token balance for a user exclusively from immutable transactions
 */
export function computeUserTokenBalance(userId: string): number {
  return tokenTransactionsState
    .filter((tx) => tx.userId === userId)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Fetch all available workspaces for current user
 */
export async function getWorkspacesEndpoint(): Promise<WorkspacesResponse> {
  await new Promise((r) => setTimeout(r, 80));
  return {
    success: true,
    data: workspacesState,
  };
}

/**
 * Create a new workspace with plan limits:
 * - Free: 1 workspace max
 * - Pro: 5 workspaces max
 * Auto-registers creator as Workspace Owner & Billing Admin in workspace_members.
 * Optionally invites an initial teammate and registers audit logs.
 */
export async function createWorkspaceEndpoint(
  data: CreateWorkspaceRequest
): Promise<ApiResponse<WorkspaceEntity>> {
  await new Promise((r) => setTimeout(r, 140));

  const userPlan = userState.plan || "pro";
  const maxAllowed = userPlan === "pro" ? 5 : 1;

  if (workspacesState.length >= maxAllowed) {
    if (userPlan === "free") {
      return {
        success: false,
        error: "Free plan is limited to 1 workspace. Upgrade to Pro to create up to 5 workspaces.",
      };
    }
    return {
      success: false,
      error: "Pro workspace limit reached (5/5). You have reached the maximum of 5 workspaces.",
    };
  }

  const slug =
    data.slug?.trim() || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const now = new Date().toISOString();
  
  // Consolidate invited members
  const invitedList = [...(data.invitedMembers || [])];
  if (data.initialMemberEmail && data.initialMemberEmail.trim()) {
    if (!invitedList.some((m) => m.email.toLowerCase() === data.initialMemberEmail!.toLowerCase().trim())) {
      invitedList.push({
        email: data.initialMemberEmail.trim(),
        role: data.memberRole || "member",
      });
    }
  }

  const newWorkspace: WorkspaceEntity = {
    id: `ws-${slug}-${Date.now().toString(36).slice(-4)}`,
    ownerId: userState.id,
    name: data.name,
    slug,
    memberCount: 1 + invitedList.length,
    createdBy: userState.id,
    updatedBy: userState.id,
    createdAt: now,
    updatedAt: now,
  };

  workspacesState = [...workspacesState, newWorkspace];

  // Auto-register owner in workspace_members join table as admin
  const ownerMember: WorkspaceMemberEntity = {
    id: `mem_${Date.now().toString(36)}_owner`,
    workspaceId: newWorkspace.id,
    userId: userState.id,
    role: "admin",
    joinedAt: now,
    createdAt: now,
  };
  workspaceMembersState = [...workspaceMembersState, ownerMember];

  // Register each invited teammate in workspace_members and audit log
  for (const inv of invitedList) {
    const inviteMember: WorkspaceMemberEntity = {
      id: `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      workspaceId: newWorkspace.id,
      userId: `usr_${inv.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_")}`,
      role: inv.role,
      joinedAt: now,
      createdAt: now,
    };
    workspaceMembersState = [...workspaceMembersState, inviteMember];

    const inviteLog: AuditLogEntity = {
      id: `log_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      actorId: userState.id,
      actorName: `${userState.firstName || "Vishal"} ${userState.lastName || "Sharma"}`,
      action: "MEMBER_INVITED",
      target: inv.email,
      details: {
        workspaceId: newWorkspace.id,
        role: inv.role,
      },
      createdAt: now,
    };
    auditLogsState = [inviteLog, ...auditLogsState];
  }

  // Record audit log for workspace creation
  const auditLog: AuditLogEntity = {
    id: `log_${Date.now().toString(36)}_ws`,
    actorId: userState.id,
    actorName: `${userState.firstName || "Vishal"} ${userState.lastName || "Sharma"}`,
    action: "WORKSPACE_CREATED",
    target: newWorkspace.id,
    details: {
      name: data.name,
      slug,
      ownerId: userState.id,
    },
    createdAt: now,
  };
  auditLogsState = [auditLog, ...auditLogsState];

  return {
    success: true,
    message: `Workspace "${data.name}" created successfully with you as Owner & Billing Admin.`,
    data: newWorkspace,
  };
}

/**
 * Fetch all members of a specific workspace
 */
export async function getWorkspaceMembersEndpoint(
  workspaceId: string
): Promise<WorkspaceMembersResponse> {
  await new Promise((r) => setTimeout(r, 60));
  const filtered = workspaceMembersState.filter((m) => m.workspaceId === workspaceId);
  return {
    success: true,
    data: filtered,
  };
}

/**
 * Fetch all projects for a specific workspace
 */
export async function getProjectsEndpoint(
  workspaceId?: string
): Promise<ProjectsResponse> {
  await new Promise((r) => setTimeout(r, 100));
  const filtered = workspaceId
    ? projectsState.filter((p) => p.workspaceId === workspaceId)
    : projectsState;

  return {
    success: true,
    data: filtered,
  };
}

/**
 * Fetch all drafts for a specific workspace
 */
export async function getDraftsEndpoint(
  workspaceId?: string
): Promise<DraftsResponse> {
  await new Promise((r) => setTimeout(r, 90));
  const filtered = workspaceId
    ? draftsState.filter((d) => d.workspaceId === workspaceId)
    : draftsState;

  return {
    success: true,
    data: filtered,
  };
}

/**
 * Fetch a specific draft by ID
 */
export async function getDraftByIdEndpoint(
  id: string
): Promise<DraftDetailResponse> {
  await new Promise((r) => setTimeout(r, 60));
  const draft = draftsState.find((d) => d.id === id);

  if (!draft) {
    return {
      success: false,
      error: `Draft with ID "${id}" not found.`,
    };
  }

  return {
    success: true,
    data: draft,
  };
}

/**
 * Fetch all messages/turns for a draft session
 */
export async function getDraftMessagesEndpoint(
  draftId: string
): Promise<DraftMessagesResponse> {
  await new Promise((r) => setTimeout(r, 60));
  const filtered = draftMessagesState.filter((m) => m.draftId === draftId);
  return {
    success: true,
    data: filtered,
  };
}

/**
 * Create a new draft session with initial user prompt message & token deduction
 */
export async function createDraftEndpoint(
  data: Partial<DraftEntity> & { title: string; workspaceId: string; prompt?: string }
): Promise<DraftDetailResponse> {
  await new Promise((r) => setTimeout(r, 150));

  const now = new Date().toISOString();
  const draftId = `draft-${Date.now().toString(36)}`;

  const newDraft: DraftEntity = {
    id: draftId,
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    title: data.title,
    description: data.description || "Freshly initialized AI coding session",
    framework: data.framework || "nextjs",
    modelUsed: data.modelUsed || "Claude 3.7 Sonnet",
    isPinned: false,
    status: "ready",
    promptsCount: 1,
    previewUrl: `/preview/${Date.now().toString(36)}`,
    createdBy: userState.id,
    updatedBy: userState.id,
    createdAt: now,
    updatedAt: now,
  };

  draftsState = [newDraft, ...draftsState];

  // Append initial prompt message if provided
  if (data.prompt) {
    const initialMessage: DraftMessageEntity = {
      id: `msg_${Date.now().toString(36)}`,
      draftId,
      role: "user",
      content: data.prompt,
      tokensUsed: 120,
      toolCalls: [],
      createdAt: now,
    };
    draftMessagesState = [initialMessage, ...draftMessagesState];
  }

  // Deduct tokens via immutable transaction ledger
  const currentBalance = computeUserTokenBalance(userState.id);
  if (currentBalance >= 120) {
    const newTx: TokenTransactionEntity = {
      id: `tx_${Date.now().toString(36)}`,
      userId: userState.id,
      amount: -120,
      type: "USAGE",
      balanceAfter: currentBalance - 120,
      createdBy: userState.id,
      createdAt: now,
    };
    tokenTransactionsState = [newTx, ...tokenTransactionsState];
  }

  // Record audit log
  const auditLog: AuditLogEntity = {
    id: `log_${Date.now().toString(36)}`,
    actorId: userState.id,
    actorName: `${userState.firstName || "Vishal"} ${userState.lastName || "Sharma"}`,
    action: "DRAFT_INITIALIZED",
    target: draftId,
    details: { workspaceId: data.workspaceId, framework: newDraft.framework },
    createdAt: now,
  };
  auditLogsState = [auditLog, ...auditLogsState];

  return {
    success: true,
    message: "Draft created successfully.",
    data: newDraft,
  };
}

/**
 * Update draft title
 */
export async function updateDraftTitleEndpoint(
  draftId: string,
  newTitle: string
): Promise<DraftDetailResponse> {
  await new Promise((r) => setTimeout(r, 60));
  const trimmed = newTitle.trim();
  if (!trimmed) {
    return { success: false, error: "Title cannot be empty." };
  }

  const index = draftsState.findIndex((d) => d.id === draftId);
  if (index === -1) {
    return { success: false, error: `Draft "${draftId}" not found.` };
  }

  const updated: DraftEntity = {
    ...draftsState[index],
    title: trimmed,
    updatedAt: new Date().toISOString(),
  };

  draftsState = [
    ...draftsState.slice(0, index),
    updated,
    ...draftsState.slice(index + 1),
  ];

  return {
    success: true,
    message: "Draft title updated.",
    data: updated,
  };
}

/**
 * Toggle favorite (pinned) status for a draft
 */
export async function toggleDraftFavoriteEndpoint(
  draftId: string
): Promise<DraftDetailResponse> {
  await new Promise((r) => setTimeout(r, 60));
  const index = draftsState.findIndex((d) => d.id === draftId);
  if (index === -1) {
    return { success: false, error: `Draft "${draftId}" not found.` };
  }

  const updated: DraftEntity = {
    ...draftsState[index],
    isPinned: !draftsState[index].isPinned,
    updatedAt: new Date().toISOString(),
  };

  draftsState = [
    ...draftsState.slice(0, index),
    updated,
    ...draftsState.slice(index + 1),
  ];

  return {
    success: true,
    message: updated.isPinned ? "Added to favorites." : "Removed from favorites.",
    data: updated,
  };
}

/**
 * Delete a draft session and its message history
 */
export async function deleteDraftEndpoint(
  draftId: string
): Promise<ApiResponse<{ id: string }>> {
  await new Promise((r) => setTimeout(r, 80));
  draftsState = draftsState.filter((d) => d.id !== draftId);
  draftMessagesState = draftMessagesState.filter((m) => m.draftId !== draftId);

  return {
    success: true,
    message: "Draft deleted successfully.",
    data: { id: draftId },
  };
}

/**
 * Fetch current user profile with token balance derived dynamically from ledger
 */
export async function getUserProfileEndpoint(): Promise<ApiResponse<UserEntity>> {
  await new Promise((r) => setTimeout(r, 50));
  const tokensAvailable = computeUserTokenBalance(userState.id);
  return {
    success: true,
    data: {
      ...userState,
      name: `${userState.firstName || "Vishal"} ${userState.lastName || "Sharma"}`,
      tokensAvailable,
    },
  };
}

/**
 * Fetch token transactions ledger for a user
 */
export async function getTokenTransactionsEndpoint(
  userId?: string
): Promise<TokenTransactionsResponse> {
  await new Promise((r) => setTimeout(r, 60));
  const targetId = userId || userState.id;
  const filtered = tokenTransactionsState.filter((tx) => tx.userId === targetId);
  return {
    success: true,
    data: filtered,
  };
}

/**
 * Switch active role between "admin" and "user"
 */
export async function toggleUserRoleEndpoint(): Promise<ApiResponse<UserEntity>> {
  await new Promise((r) => setTimeout(r, 50));
  userState.role = userState.role === "admin" ? "user" : "admin";
  const tokensAvailable = computeUserTokenBalance(userState.id);
  return {
    success: true,
    message: `Switched view mode to ${userState.role}`,
    data: {
      ...userState,
      name: `${userState.firstName || "Vishal"} ${userState.lastName || "Sharma"}`,
      tokensAvailable,
    },
  };
}

/**
 * Fetch immutable audit logs trail
 */
export async function getAuditLogsEndpoint(): Promise<AuditLogsResponse> {
  await new Promise((r) => setTimeout(r, 60));
  return {
    success: true,
    data: auditLogsState,
  };
}

/**
 * Upgrade or change current user plan (free <-> pro)
 */
export async function updateUserPlanEndpoint(
  plan: "free" | "pro"
): Promise<ApiResponse<UserEntity>> {
  await new Promise((r) => setTimeout(r, 100));
  userState = { ...userState, plan, updatedAt: new Date().toISOString() };
  const tokensAvailable = computeUserTokenBalance(userState.id);

  // If upgrading to pro, grant 100k tokens in ledger
  if (plan === "pro") {
    const grantTx: TokenTransactionEntity = {
      id: `tx_${Date.now().toString(36)}`,
      userId: userState.id,
      amount: 100000,
      type: "GRANT",
      stripePaymentId: `sub_${Date.now().toString(36)}`,
      pricePaidUsd: 20.0,
      balanceAfter: tokensAvailable + 100000,
      createdBy: userState.id,
      createdAt: new Date().toISOString(),
    };
    tokenTransactionsState = [grantTx, ...tokenTransactionsState];
  }

  return {
    success: true,
    data: {
      ...userState,
      name: `${userState.firstName || "Vishal"} ${userState.lastName || "Sharma"}`,
      tokensAvailable: computeUserTokenBalance(userState.id),
    },
    message: `Account tier upgraded to ${plan.toUpperCase()} successfully.`,
  };
}
