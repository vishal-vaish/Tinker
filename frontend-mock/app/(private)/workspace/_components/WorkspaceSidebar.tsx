"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  FolderGit2,
  FileCode2,
  Layers,
  Sparkles,
  Zap,
  Pin,
  Clock,
  MoreVertical,
  Star,
} from "lucide-react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkspaceSelect } from "./WorkspaceSelect";
import { SidebarDraftItem } from "./SidebarDraftItem";

export function WorkspaceSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    drafts,
    projects,
    user,
    activeDraftId,
    selectDraft,
    createNewChat,
    role,
  } = useWorkspace();

  const isProjectsRoute = pathname === "/workspace/projects";
  const favoriteDrafts = drafts.filter((d) => d.isPinned);

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" className="p-0">
      {/* 1. Header: Workspace Selector + Sidebar Collapse Toggle Button */}
      <SidebarHeader className="p-2.5">
        <div className="flex items-center justify-between gap-1.5">
          <WorkspaceSelect />
          <SidebarTrigger className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground" />
        </div>

        {/* 2. + New Chat Button */}
        <Button
          onClick={createNewChat}
          size="sm"
          className="w-full justify-center gap-2 mt-2 font-medium"
        >
          <Plus className="size-4" />
          <span>New Chat</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* 3. Primary Navigation Menu: Projects item */}
        <SidebarGroup className="p-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isProjectsRoute}
                onClick={() => router.push("/workspace/projects")}
                className="cursor-pointer font-medium"
              >
                <FolderGit2 className="size-4 text-primary" />
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* 4. Separator Line */}
        <SidebarSeparator className="my-2" />

        {/* 5. FAVORITES Section (Rendered above Drafts when drafts are favorited) */}
        {favoriteDrafts.length > 0 && (
          <>
            <SidebarGroup className="p-0">
              <div className="flex items-center justify-between px-2 py-1">
                <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Star className="size-3 text-amber-500 fill-amber-500" />
                  <span>Favorites</span>
                </SidebarGroupLabel>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono px-1.5 py-0 h-4 text-amber-500 border-amber-500/30"
                >
                  {favoriteDrafts.length}
                </Badge>
              </div>

              <SidebarGroupContent>
                <SidebarMenu>
                  {favoriteDrafts.map((draft) => {
                    const isActive =
                      activeDraftId === draft.id && !isProjectsRoute;
                    return (
                      <SidebarDraftItem
                        key={`fav-${draft.id}`}
                        draft={draft}
                        isActive={isActive}
                        hideFavoriteIcon={true}
                        onSelect={() => selectDraft(draft.id)}
                      />
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="my-2" />
          </>
        )}

        {/* 6. DRAFTS Section */}
        <SidebarGroup className="p-0">
          <div className="flex items-center justify-between px-2 py-1">
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Drafts
            </SidebarGroupLabel>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">
              {drafts.length}
            </Badge>
          </div>

          <SidebarGroupContent>
            {drafts.length === 0 ? (
              <div className="px-2.5 py-3 text-center rounded-lg border border-dashed border-sidebar-border mx-1 my-1 bg-sidebar-accent/20">
                <p className="text-[11px] text-muted-foreground">No drafts in this workspace</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewChat}
                  className="mt-1 text-xs text-primary hover:text-primary cursor-pointer h-6 px-2"
                >
                  <Plus className="size-3 mr-1" />
                  <span>Start first draft</span>
                </Button>
              </div>
            ) : (
              <SidebarMenu>
                {drafts.map((draft) => {
                  const isActive = activeDraftId === draft.id && !isProjectsRoute;
                  return (
                    <SidebarDraftItem
                      key={draft.id}
                      draft={draft}
                      isActive={isActive}
                      onSelect={() => selectDraft(draft.id)}
                    />
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 5. Separator Line + PROJECTS List Section */}
        <SidebarSeparator className="my-2" />

        <SidebarGroup className="p-0">
          <div className="flex items-center justify-between px-2 py-1">
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Projects
            </SidebarGroupLabel>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4">
              {projects.length}
            </Badge>
          </div>

          <SidebarGroupContent>
            {projects.length === 0 ? (
              <div className="px-2.5 py-2 text-center text-[10px] text-muted-foreground font-mono">
                No repositories attached
              </div>
            ) : (
              <SidebarMenu>
                {projects.map((proj) => (
                  <SidebarMenuItem key={proj.id}>
                    <SidebarMenuButton
                      onClick={() => router.push("/workspace/projects")}
                      className="cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Layers className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate text-muted-foreground hover:text-foreground">
                          {proj.name}
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 6. Footer: User Avatar & Name with Token count on the right */}
      <SidebarFooter className="p-3 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          {/* User Avatar and Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white text-xs font-bold">
              {user?.name?.substring(0, 2).toUpperCase() || "VS"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-foreground">
                {user?.name || "Vishal Sharma"}
              </span>
              <span className="truncate text-[10px] text-muted-foreground capitalize">
                {role}
              </span>
            </div>
          </div>

          {/* Real-time Token Count on the Right */}
          <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-md bg-sidebar-accent/60 border border-border">
            <Zap className="size-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-mono font-bold text-foreground">
              {user?.tokensAvailable
                ? `${(user.tokensAvailable / 1000).toFixed(1)}k`
                : "85.4k"}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
