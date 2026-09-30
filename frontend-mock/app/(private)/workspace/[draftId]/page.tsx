"use client";

import { useWorkspace } from "@/providers/WorkspaceProvider";
import { WorkspaceDraftHeader } from "../_components/WorkspaceDraftHeader";
import { ActiveDraftCanvas } from "../_components/ActiveDraftCanvas";
import { WorkspaceFooterBar } from "../_components/WorkspaceFooterBar";
import { PromptHeroStudio } from "../_components/PromptHeroStudio";

export default function DraftPage() {
  const { activeDraft } = useWorkspace();

  if (!activeDraft) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center overflow-y-auto">
        <PromptHeroStudio />
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <WorkspaceDraftHeader />
      <main className="flex-1 flex overflow-hidden">
        <ActiveDraftCanvas />
      </main>
      <WorkspaceFooterBar />
    </div>
  );
}
