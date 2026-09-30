"use client";

import { useState, Fragment } from "react";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Building2,
  Sparkles,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CreateWorkspaceForm } from "@/components/forms/CreateWorkspaceForm";

function PlanBadge({ plan, className }: { plan: "free" | "pro"; className?: string }) {
  if (plan === "pro") {
    return (
      <Badge
        className={cn(
          "text-[10px] uppercase font-mono px-1.5 py-0 h-4 font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xs shadow-amber-500/20",
          className
        )}
      >
        pro
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] uppercase font-mono px-1.5 py-0 h-4 font-medium text-muted-foreground border-border",
        className
      )}
    >
      free
    </Badge>
  );
}

export function WorkspaceSelect() {
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    maxWorkspaces,
    canCreateWorkspace,
    userPlan,
    upgradeUserPlan,
    user,
  } = useWorkspace();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeWorkspace) return null;

  const handleUpgradeToPro = async () => {
    setIsSubmitting(true);
    try {
      await upgradeUserPlan("pro");
      setIsUpgradeDialogOpen(false);
    } catch (err) {
      console.error("Upgrade failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-left transition-colors outline-none cursor-pointer flex-1 min-w-0">
          <span className="truncate text-sm font-semibold text-foreground">
            {activeWorkspace.name}
          </span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-68 p-1.5" align="start">
          {/* Header showing workspaces quota */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50 pb-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground">Workspaces</span>
              <span className="text-[11px] font-mono text-muted-foreground">
                ({workspaces.length}/{maxWorkspaces})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Tier:</span>
              <PlanBadge plan={userPlan} />
            </div>
          </div>

          <DropdownMenuGroup>
            {workspaces.map((ws, index) => (
              <Fragment key={ws.id}>
                {index > 0 && <DropdownMenuSeparator className="my-1" />}
                <DropdownMenuItem
                  onClick={() => switchWorkspace(ws.id)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer group"
                >
                  <div className="flex flex-col min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate text-foreground group-hover:text-primary transition-colors">
                        {ws.name}
                      </span>
                      {ws.ownerId === user?.id && (
                        <span className="text-[9px] font-mono px-1 py-0 rounded bg-muted text-muted-foreground border border-border">
                          Owner
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {ws.memberCount || 1} {ws.memberCount === 1 ? "member" : "members"}
                    </span>
                  </div>
                  {ws.id === activeWorkspace.id && (
                    <Check className="size-3.5 text-primary shrink-0 ml-2" />
                  )}
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          {/* Create Workspace action or Upgrade Callout depending on quota */}
          {canCreateWorkspace ? (
            <DropdownMenuItem
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center justify-between gap-2 px-2 py-2 rounded-md cursor-pointer text-primary hover:text-primary font-medium text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded border border-dashed border-primary/50 text-primary">
                  <Plus className="size-3.5" />
                </div>
                <span>Create new workspace</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {maxWorkspaces - workspaces.length} left
              </span>
            </DropdownMenuItem>
          ) : userPlan === "free" ? (
            <DropdownMenuItem
              onClick={() => setIsUpgradeDialogOpen(true)}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-md cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-foreground transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold">Upgrade for 5 Workspaces</span>
                  <span className="text-[10px] text-muted-foreground">Free limit reached (1/1)</span>
                </div>
              </div>
              <Badge className="text-[9px] uppercase font-mono px-1.5 py-0 h-4 font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xs">
                PRO
              </Badge>
            </DropdownMenuItem>
          ) : (
            <div className="px-2.5 py-2 text-[11px] text-muted-foreground flex items-center justify-between bg-muted/40 rounded-md mx-1 my-0.5">
              <span>Workspace quota reached</span>
              <span className="font-mono text-[10px] font-bold text-foreground">
                {workspaces.length} / {maxWorkspaces} used
              </span>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Modal to Add New Workspace */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-1 pb-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Building2 className="size-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Create New Workspace
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Workspaces isolate projects, sandboxes, PostgreSQL databases, and team permissions.
            </DialogDescription>
          </DialogHeader>

          <CreateWorkspaceForm
            onSuccess={() => setIsDialogOpen(false)}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Upgrade to Pro Modal */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-1 pb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Sparkles className="size-4" />
                </div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Unlock Up to 5 Workspaces
                </DialogTitle>
              </div>
              <Badge className="text-[10px] uppercase font-mono px-2 py-0.5 font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xs">
                PRO PLAN
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Your Free account is limited to 1 single workspace. Upgrade to Pro to create and manage up to 5 distinct team workspaces.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-semibold text-foreground">5 Workspaces Allowance</span>
                <p className="text-muted-foreground text-[11px]">
                  Separate environments for personal, client, staging, and production teams.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-muted/30">
              <Zap className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-semibold text-foreground">100,000 Monthly Tokens</span>
                <p className="text-muted-foreground text-[11px]">
                  Power complex agent runs and multi-file fullstack scaffolding.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setIsUpgradeDialogOpen(false)}
              className="cursor-pointer font-medium"
            >
              Maybe Later
            </Button>
            <Button
              type="button"
              size="default"
              onClick={handleUpgradeToPro}
              disabled={isSubmitting}
              className="gap-2 cursor-pointer font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600 shadow-sm"
            >
              <Sparkles className="size-4" />
              <span>{isSubmitting ? "Upgrading..." : "Upgrade to Pro"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
