"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import type {
  WorkspaceEntity,
  ProjectEntity,
  DraftEntity,
  UserEntity,
  CreateWorkspaceRequest,
} from "@/lib/types";
import type { CreateWorkspaceFormValues } from "@/lib/schemas";
import {
  getWorkspacesEndpoint,
  getDraftsEndpoint,
  getProjectsEndpoint,
  getUserProfileEndpoint,
  createDraftEndpoint,
  createWorkspaceEndpoint,
  toggleUserRoleEndpoint,
  updateUserPlanEndpoint,
  updateDraftTitleEndpoint,
  toggleDraftFavoriteEndpoint,
  deleteDraftEndpoint,
} from "@/action/workspace";

interface WorkspaceContextType {
  workspaces: WorkspaceEntity[];
  activeWorkspace: WorkspaceEntity | null;
  switchWorkspace: (workspaceId: string) => void;
  createNewWorkspace: (
    input: string | CreateWorkspaceFormValues
  ) => Promise<{ success: boolean; error?: string; workspace?: WorkspaceEntity }>;
  workspaceCreationAlert: string | null;
  dismissWorkspaceCreationAlert: () => void;
  maxWorkspaces: number;
  canCreateWorkspace: boolean;
  userPlan: "free" | "pro";
  upgradeUserPlan: (plan: "free" | "pro") => Promise<void>;
  drafts: DraftEntity[];
  projects: ProjectEntity[];
  user: UserEntity | null;
  activeDraftId: string | null;
  activeDraft: DraftEntity | null;
  activeView: "studio" | "draft" | "projects";
  setActiveView: (view: "studio" | "draft" | "projects") => void;
  selectDraft: (draftId: string | null) => void;
  createNewChat: () => void;
  createNewDraft: (
    title: string,
    prompt: string,
    framework?: "nextjs" | "vite" | "fastify" | "remix"
  ) => Promise<DraftEntity | null>;
  updateDraftTitle: (draftId: string, newTitle: string) => Promise<boolean>;
  toggleDraftFavorite: (draftId: string) => Promise<boolean>;
  deleteDraft: (draftId: string) => Promise<boolean>;
  role: "admin" | "user";
  toggleRole: () => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [workspaces, setWorkspaces] = useState<WorkspaceEntity[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceEntity | null>(null);
  const [drafts, setDrafts] = useState<DraftEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [user, setUser] = useState<UserEntity | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"studio" | "draft" | "projects">("studio");
  const [isLoading, setIsLoading] = useState(true);

  // Sync state from server/mock db on mount
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [wsRes, userRes] = await Promise.all([
          getWorkspacesEndpoint(),
          getUserProfileEndpoint(),
        ]);

        if (wsRes.success && wsRes.data && wsRes.data.length > 0) {
          setWorkspaces(wsRes.data);
          const initialWs = wsRes.data[0];
          setActiveWorkspace(initialWs);

          const [draftsRes, projsRes] = await Promise.all([
            getDraftsEndpoint(initialWs.id),
            getProjectsEndpoint(initialWs.id),
          ]);

          if (draftsRes.success && draftsRes.data) {
            setDrafts(draftsRes.data);
          }
          if (projsRes.success && projsRes.data) {
            setProjects(projsRes.data);
          }
        }

        if (userRes.success && userRes.data) {
          setUser(userRes.data);
        }
      } catch (err) {
        console.error("Failed to load workspace data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Update active draft based on pathname if navigating directly
  useEffect(() => {
    if (pathname.includes("/workspace/projects")) {
      setActiveView("projects");
      setActiveDraftId(null);
    } else {
      const match = pathname.match(/\/workspace\/([^/]+)/);
      if (match && match[1] && match[1] !== "projects") {
        setActiveDraftId(match[1]);
        setActiveView("draft");
      } else if (pathname === "/workspace") {
        setActiveDraftId(null);
        setActiveView("studio");
      }
    }
  }, [pathname]);

  const activeDraft = useMemo(() => {
    if (!activeDraftId) return null;
    return drafts.find((d) => d.id === activeDraftId) || null;
  }, [drafts, activeDraftId]);

  const switchWorkspace = async (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (!ws) return;
    setActiveWorkspace(ws);
    setActiveDraftId(null);
    setActiveView("studio");

    const [draftsRes, projsRes] = await Promise.all([
      getDraftsEndpoint(ws.id),
      getProjectsEndpoint(ws.id),
    ]);
    if (draftsRes.success && draftsRes.data) setDrafts(draftsRes.data);
    if (projsRes.success && projsRes.data) setProjects(projsRes.data);

    router.push("/workspace");
  };

  const selectDraft = (draftId: string | null) => {
    if (!draftId) {
      setActiveDraftId(null);
      setActiveView("studio");
      router.push("/workspace");
    } else {
      setActiveDraftId(draftId);
      setActiveView("draft");
      router.push(`/workspace/${draftId}`);
    }
  };

  const createNewChat = () => {
    setActiveDraftId(null);
    setActiveView("studio");
    router.push("/workspace");
  };

  const createNewDraft = async (
    title: string,
    prompt: string,
    framework: "nextjs" | "vite" | "fastify" | "remix" = "nextjs"
  ): Promise<DraftEntity | null> => {
    if (!activeWorkspace) return null;

    const res = await createDraftEndpoint({
      workspaceId: activeWorkspace.id,
      title: title || "New Generation Session",
      description: prompt,
      prompt,
      framework,
    });

    if (res.success && res.data) {
      setDrafts((prev) => [res.data!, ...prev]);
      setActiveDraftId(res.data.id);
      setActiveView("draft");

      // Refresh user tokens
      const uRes = await getUserProfileEndpoint();
      if (uRes.success && uRes.data) setUser(uRes.data);

      router.push(`/workspace/${res.data.id}`);
      return res.data;
    }

    return null;
  };

  const updateDraftTitle = async (
    draftId: string,
    newTitle: string
  ): Promise<boolean> => {
    const res = await updateDraftTitleEndpoint(draftId, newTitle);
    if (res.success && res.data) {
      setDrafts((prev) =>
        prev.map((d) => (d.id === draftId ? res.data! : d))
      );
      return true;
    }
    return false;
  };

  const toggleDraftFavorite = async (draftId: string): Promise<boolean> => {
    const res = await toggleDraftFavoriteEndpoint(draftId);
    if (res.success && res.data) {
      setDrafts((prev) =>
        prev.map((d) => (d.id === draftId ? res.data! : d))
      );
      return true;
    }
    return false;
  };

  const deleteDraft = async (draftId: string): Promise<boolean> => {
    const res = await deleteDraftEndpoint(draftId);
    if (res.success) {
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      if (activeDraftId === draftId) {
        selectDraft(null);
      }
      return true;
    }
    return false;
  };

  const userPlan: "free" | "pro" = user?.plan || "pro";
  const maxWorkspaces = userPlan === "pro" ? 5 : 1;
  const canCreateWorkspace = workspaces.length < maxWorkspaces;

  const [workspaceCreationAlert, setWorkspaceCreationAlert] = useState<string | null>(null);
  const dismissWorkspaceCreationAlert = () => setWorkspaceCreationAlert(null);

  const upgradeUserPlan = async (plan: "free" | "pro") => {
    const res = await updateUserPlanEndpoint(plan);
    if (res.success && res.data) {
      setUser(res.data);
    }
  };

  const createNewWorkspace = async (
    input: string | CreateWorkspaceFormValues
  ): Promise<{ success: boolean; error?: string; workspace?: WorkspaceEntity }> => {
    const payload: CreateWorkspaceRequest =
      typeof input === "string"
        ? {
            name: input,
            slug: input.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            invitedMembers: [],
            memberRole: "member",
          }
        : {
            ...input,
            invitedMembers: input.invitedMembers || [],
          };

    const res = await createWorkspaceEndpoint(payload);
    if (res.success && res.data) {
      setWorkspaces((prev) => [...prev, res.data!]);
      setActiveWorkspace(res.data);
      setActiveDraftId(null);
      // Clean slate for new workspace
      const [draftsRes, projsRes] = await Promise.all([
        getDraftsEndpoint(res.data.id),
        getProjectsEndpoint(res.data.id),
      ]);
      setDrafts(draftsRes.data || []);
      setProjects(projsRes.data || []);
      setActiveView("studio");
      setWorkspaceCreationAlert(
        res.message ||
          `Workspace "${res.data.name}" created with you as Owner & Billing Admin.`
      );
      router.push("/workspace");
      return { success: true, workspace: res.data };
    }
    return { success: false, error: res.error || "Failed to create workspace." };
  };

  const toggleRole = async () => {
    const res = await toggleUserRoleEndpoint();
    if (res.success && res.data) {
      setUser(res.data);
    }
  };

  const role: "admin" | "user" = user?.role === "admin" ? "admin" : "user";

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        switchWorkspace,
        createNewWorkspace,
        workspaceCreationAlert,
        dismissWorkspaceCreationAlert,
        maxWorkspaces,
        canCreateWorkspace,
        userPlan,
        upgradeUserPlan,
        drafts,
        projects,
        user,
        activeDraftId,
        activeDraft,
        activeView,
        setActiveView,
        selectDraft,
        createNewChat,
        createNewDraft,
        updateDraftTitle,
        toggleDraftFavorite,
        deleteDraft,
        role,
        toggleRole,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
