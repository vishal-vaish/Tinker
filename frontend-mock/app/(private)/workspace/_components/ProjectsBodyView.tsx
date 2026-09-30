"use client";

import { useState } from "react";
import { FolderGit2, Plus, Search, Star, GitBranch, Terminal, ExternalLink, Layers } from "lucide-react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ProjectsBodyView() {
  const { projects, activeWorkspace, createNewChat } = useWorkspace();
  const { open } = useSidebar();
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            {!open && (
              <SidebarTrigger className="mr-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0" />
            )}
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
            <Badge variant="outline" className="text-xs font-mono">
              {projects.length} Total
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Repositories and isolated WebContainer projects inside {activeWorkspace?.name || "Workspace"}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-48 sm:w-64">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 h-9.5 text-xs bg-muted/40"
            />
          </div>

          <Button size="default" onClick={createNewChat} className="gap-2 shrink-0 cursor-pointer font-semibold shadow-xs">
            <Plus className="size-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((proj) => (
          <Card
            key={proj.id}
            className="flex flex-col justify-between border-border bg-card/60 hover:border-primary/40 transition-all group"
          >
            <CardHeader className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted text-foreground">
                    <FolderGit2 className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {proj.name}
                  </CardTitle>
                </div>
                <Badge
                  variant={
                    proj.status === "active"
                      ? "default"
                      : proj.status === "ready"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-[10px] font-mono capitalize px-1.5 py-0"
                >
                  {proj.status}
                </Badge>
              </div>

              <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                {proj.description || "No description provided for this project."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/60">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-mono uppercase px-1 py-0 h-3.5">
                    {proj.framework}
                  </Badge>
                  {proj.branch && (
                    <span className="flex items-center gap-1 font-mono">
                      <GitBranch className="size-3" />
                      {proj.branch}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {proj.starsCount !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 text-amber-400 fill-amber-400" />
                      {proj.starsCount}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={createNewChat}
                    className="hover:text-primary"
                    title="Open in Sandbox Studio"
                  >
                    <ExternalLink className="size-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed border-border rounded-xl">
            <Layers className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">No projects found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a new prompt or start a new project to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
