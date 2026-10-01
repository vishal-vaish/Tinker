"use client";

import { useState } from "react";
import { Star, Pencil, Trash2, MoreHorizontal, Layers } from "lucide-react";
import type { ProjectEntity } from "@/lib/types";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SidebarProjectItemProps {
  project: ProjectEntity;
  isActive: boolean;
  onSelect: () => void;
  hideFavoriteIcon?: boolean;
}

export function SidebarProjectItem({
  project,
  isActive,
  onSelect,
  hideFavoriteIcon = false,
}: SidebarProjectItemProps) {
  const { updateProjectName, toggleProjectFavorite, deleteProject } = useWorkspace();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState(project.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameName.trim() || isRenaming) return;

    setIsRenaming(true);
    try {
      await updateProjectName(project.id, renameName.trim());
      setIsRenameOpen(false);
    } catch (err) {
      console.error("Failed to rename project:", err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleProjectFavorite(project.id);
    } catch (err) {
      console.error("Failed to toggle project favorite:", err);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <SidebarMenuItem className="group/menu-item relative">
        <SidebarMenuButton
          isActive={isActive}
          onClick={onSelect}
          className={cn(
            "cursor-pointer flex items-center justify-between text-xs py-2 pr-8 h-8 transition-colors",
            "group-hover/menu-item:bg-sidebar-accent group-hover/menu-item:text-sidebar-accent-foreground",
            "group-has-[[aria-expanded=true]]/menu-item:bg-sidebar-accent group-has-[[aria-expanded=true]]/menu-item:text-sidebar-accent-foreground"
          )}
          title={project.name}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Layers className="size-3.5 text-muted-foreground shrink-0" />
            {project.isPinned && !hideFavoriteIcon && (
              <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />
            )}
            <span className="truncate font-medium text-foreground">
              {project.name}
            </span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuAction
                showOnHover
                className="cursor-pointer text-muted-foreground hover:text-primary bg-transparent hover:bg-transparent shadow-none border-0 transition-colors z-10"
              />
            }
          >
            <MoreHorizontal className="size-3.5 transition-colors" />
            <span className="sr-only">Project actions</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={8}
            collisionAvoidance={{ side: "none" }}
            className="w-48"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setRenameName(project.name);
                setIsRenameOpen(true);
              }}
              className="cursor-pointer gap-2 text-xs"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
              <span>Edit</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="cursor-pointer gap-2 text-xs"
            >
              <Star
                className={cn(
                  "size-3.5",
                  project.isPinned
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground"
                )}
              />
              <span>
                {project.isPinned ? "Remove from favorite" : "Add to favorite"}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteOpen(true);
              }}
              className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5" />
              <span>Delete project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Rename Dialog Modal */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-1 pb-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Pencil className="size-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Edit Project Name
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Rename this project to organize your repositories and development environments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRenameSubmit} className="space-y-4 pt-1">
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Enter project name..."
              autoFocus
              className="h-10 text-sm"
            />
            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => setIsRenameOpen(false)}
                className="cursor-pointer font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="default"
                disabled={!renameName.trim() || isRenaming}
                className="cursor-pointer font-semibold shadow-xs"
              >
                {isRenaming ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-1 pb-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <Trash2 className="size-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-destructive">
                Delete Project
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{project.name}"
              </span>
              ? This repository and its associated workspace environments will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setIsDeleteOpen(false)}
              className="cursor-pointer font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="default"
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer font-semibold shadow-xs"
            >
              {isDeleting ? "Deleting..." : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
