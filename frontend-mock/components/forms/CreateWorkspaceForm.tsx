"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Globe,
  UserPlus,
  Shield,
  Check,
  AlertCircle,
  Users,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DialogFooter } from "@/components/ui/dialog";
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
  const [emailInput, setEmailInput] = useState("");
  const [emailInputError, setEmailInputError] = useState<string | null>(null);

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
      invitedMembers: [],
      initialMemberEmail: "",
      memberRole: "member",
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "invitedMembers",
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

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

  const handleAddEmail = () => {
    const trimmed = emailInput.trim().replace(/,/g, "");
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailInputError("Please enter a valid email address");
      return;
    }

    const alreadyExists = fields.some(
      (m) => m.email.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyExists) {
      setEmailInputError("This email has already been added");
      return;
    }

    append({ email: trimmed, role: "member" });
    setEmailInput("");
    setEmailInputError(null);
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const onSubmit = async (data: CreateWorkspaceFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const pendingEmail = emailInput.trim().replace(/,/g, "");
      const payload: CreateWorkspaceFormValues = { ...data };
      if (pendingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pendingEmail)) {
        if (!payload.invitedMembers.some((m) => m.email.toLowerCase() === pendingEmail.toLowerCase())) {
          payload.invitedMembers = [
            ...payload.invitedMembers,
            { email: pendingEmail, role: "member" },
          ];
        }
      }

      const res = await createNewWorkspace(payload);
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

      {/* Field 3: Team Member Invites (workspace_members integration) */}
      <div className="space-y-2.5 pt-2 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Users className="size-3.5 text-muted-foreground" />
            <span>Invite Teammates</span>
          </label>
          <span className="text-[11px] text-muted-foreground font-normal">(Optional)</span>
        </div>

        {/* Full-width email input with Add button */}
        <div className="space-y-1.5">
          <div className="relative flex items-center w-full">
            <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground shrink-0 z-10 pointer-events-none" />
            <Input
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (emailInputError) setEmailInputError(null);
              }}
              onKeyDown={handleEmailKeyDown}
              placeholder="Type teammate email and press Enter..."
              className="h-10 pl-10 pr-20 text-xs bg-muted/40 border-input w-full rounded-xl"
            />
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={handleAddEmail}
              disabled={!emailInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2.5 text-[11px] font-medium cursor-pointer"
            >
              <Plus className="size-3" />
              <span>Add</span>
            </Button>
          </div>

          {emailInputError && (
            <p className="text-[11px] text-destructive px-1 font-medium">
              {emailInputError}
            </p>
          )}
        </div>

        {/* List of added teammates: Left = email, Right = authority tabs with unique colors */}
        {fields.length > 0 && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 pt-0.5">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/70 text-xs gap-2 transition-all hover:bg-muted/50"
              >
                {/* Left side: Avatar initial, Email, and Remove button */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 uppercase">
                    {field.email[0]}
                  </div>
                  <span className="truncate font-medium text-foreground text-xs">
                    {field.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive p-0.5 rounded cursor-pointer transition-colors shrink-0"
                    title="Remove teammate"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* Right side: Authority selector with unique color for all 3 */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-background/80 border border-input shrink-0">
                  {(["viewer", "member", "admin"] as const).map((r) => {
                    const isSelected = field.role === r;
                    const roleColor =
                      r === "admin"
                        ? "bg-purple-600 text-white font-semibold shadow-xs shadow-purple-500/30"
                        : r === "member"
                        ? "bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-500/30"
                        : "bg-amber-600 text-white font-semibold shadow-xs shadow-amber-500/30";

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => update(index, { ...field, role: r })}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-medium capitalize transition cursor-pointer select-none",
                          isSelected
                            ? roleColor
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ownership & Audit Notice */}
      <div className="rounded-lg bg-muted/30 p-2.5 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
        <Shield className="size-3.5 text-primary shrink-0" />
        <span>
          You (<span className="font-semibold text-foreground">{user?.name || "Current User"}</span>) will be recorded as Workspace Owner & Billing Admin in the audit log.
        </span>
      </div>

      {/* Dialog Actions */}
      <DialogFooter className="pt-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onCancel}
            disabled={isSubmitting}
            className="cursor-pointer font-medium"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="default"
          disabled={isSubmitting}
          className="gap-2 cursor-pointer font-semibold shadow-xs"
        >
          {isSubmitting ? (
            <>
              <span className="size-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              <span>Provisioning Workspace...</span>
            </>
          ) : (
            <>
              <Check className="size-4" />
              <span>Create Workspace</span>
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
