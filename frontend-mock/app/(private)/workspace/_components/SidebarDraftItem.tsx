"use client";

import { useState } from "react";
import { Star, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import type { DraftEntity } from "@/lib/types";
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

interface SidebarDraftItemProps {
  draft: DraftEntity;
  isActive: boolean;
  onSelect: () => void;
  hideFavoriteIcon?: boolean;
}

export function SidebarDraftItem({
  draft,
  isActive,
  onSelect,
  hideFavoriteIcon = false,
}: SidebarDraftItemProps) {
  const { updateDraftTitle, toggleDraftFavorite, deleteDraft } = useWorkspace();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState(draft.title);
  const [isRenaming, setIsRenaming] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTitle.trim() || isRenaming) return;

    setIsRenaming(true);
    try {
      await updateDraftTitle(draft.id, renameTitle.trim());
      setIsRenameOpen(false);
    } catch (err) {
      console.error("Failed to rename draft:", err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleDraftFavorite(draft.id);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDraft(draft.id);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete draft:", err);
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
          title={draft.title}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {draft.isPinned && !hideFavoriteIcon && (
              <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />
            )}
            <span className="truncate font-medium text-foreground">
              {draft.title}
            </span>
          </div>
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
            <span className="sr-only">Draft actions</span>
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
                setRenameTitle(draft.title);
                setIsRenameOpen(true);
              }}
              className="cursor-pointer gap-2 text-xs"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
              <span>Edit title</span>
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
                  draft.isPinned
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground"
                )}
              />
              <span>
                {draft.isPinned ? "Remove from favorite" : "Add to favorite"}
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
              <span>Delete draft</span>
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
                Edit Draft Title
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Give this draft session a clear name to organize your workspace workflows.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRenameSubmit} className="space-y-4 pt-1">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Enter draft title..."
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
                disabled={!renameTitle.trim() || isRenaming}
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
                Delete Draft Session
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{draft.title}"
              </span>
              ? This session history and its messages will be permanently removed.
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
              {isDeleting ? "Deleting..." : "Delete draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
