"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Globe,
  UserPlus,
  Shield,
  Check,
  AlertCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CustomInput from "@/components/global/CustomInput";
import {
  createWorkspaceSchema,
  type CreateWorkspaceFormValues,
} from "@/lib/schemas";
import { useWorkspace } from "@/providers/WorkspaceProvider";
import { cn } from "@/lib/utils";

interface CreateWorkspaceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateWorkspaceForm({
  onSuccess,
  onCancel,
}: CreateWorkspaceFormProps) {
  const {
    workspaces,
    maxWorkspaces,
    userPlan,
    createNewWorkspace,
    user,
  } = useWorkspace();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkspaceFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      initialMemberEmail: "",
      memberRole: "member",
    },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");
  const selectedRole = watch("memberRole");

  // Auto-slugify workspace name as user types unless manually modified
  useEffect(() => {
    if (!isSlugManuallyEdited && nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, isSlugManuallyEdited, setValue]);

  const onSubmit = async (data: CreateWorkspaceFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await createNewWorkspace(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to create workspace.");
        return;
      }
      onSuccess?.();
    } catch (err) {
      console.error("Workspace creation failed:", err);
      setErrorMessage("An unexpected error occurred while creating workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Quota & Allowance Status Header */}
      <div className="rounded-lg bg-muted/40 p-3 border border-border/60 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-primary shrink-0" />
          <span className="text-muted-foreground">Workspace Quota:</span>
          <span className="font-semibold text-foreground">
            {workspaces.length} of {maxWorkspaces} used
          </span>
        </div>
        {userPlan === "pro" ? (
          <Badge className="text-[10px] uppercase font-mono px-2 py-0.5 font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xs shadow-amber-500/20">
            PRO TIER
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
            FREE TIER
          </Badge>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Field 1: Workspace Name */}
      <CustomInput
        control={control}
        name="name"
        label="Workspace Name"
        icon={Building2}
        placeholder="e.g. Acme Cloud Corp"
        isRequired
      />

      {/* Field 2: Workspace Slug / URL */}
      <div className="space-y-1">
        <CustomInput
          control={control}
          name="slug"
          label="Workspace Slug / URL Handle"
          icon={Globe}
          placeholder="e.g. acme-cloud-corp"
          onChange={() => setIsSlugManuallyEdited(true)}
          isRequired
        />
        {slugValue && (
          <p className="text-[11px] font-mono text-muted-foreground px-1 truncate">
            URL: <span className="text-primary font-medium">tinker.dev/workspace/{slugValue}</span>
          </p>
        )}
      </div>

      {/* Field 3: Team Member Invite (workspace_members integration) */}
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Users className="size-3.5 text-muted-foreground" />
            <span>Invite Initial Teammate</span>
          </label>
          <span className="text-[10px] text-muted-foreground font-mono">Optional</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <CustomInput
              control={control}
              name="initialMemberEmail"
              label="Teammate Email"
              icon={UserPlus}
              placeholder="colleague@company.com"
              isRequired={false}
            />
          </div>

          <div className="pt-2">
            <Controller
              control={control}
              name="memberRole"
              render={({ field }) => (
                <div className="flex h-11 items-center gap-1 p-1 rounded-xl bg-muted/40 border border-input text-xs">
                  {(["member", "admin", "viewer"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => field.onChange(r)}
                      className={cn(
                        "flex-1 h-full rounded-lg text-[10px] font-medium capitalize transition cursor-pointer flex items-center justify-center",
                        field.value === r
                          ? "bg-card text-foreground font-bold shadow-xs border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Ownership & Audit Notice */}
      <div className="rounded-lg bg-muted/30 p-2.5 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
        <Shield className="size-3.5 text-primary shrink-0" />
        <span>
          You (<span className="font-semibold text-foreground">{user?.name || "Current User"}</span>) will be recorded as Workspace Owner & Billing Admin in the audit log.
        </span>
      </div>

      {/* Dialog Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="gap-1.5"
        >
          {isSubmitting ? (
            <>
              <span className="size-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              <span>Provisioning Workspace...</span>
            </>
          ) : (
            <>
              <Check className="size-3.5" />
              <span>Create Workspace</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
