"use client";

import { useWorkspace } from "@/providers/WorkspaceProvider";
import { PromptHeroStudio } from "./_components/PromptHeroStudio";
import { WorkspaceDraftHeader } from "./_components/WorkspaceDraftHeader";
import { ActiveDraftCanvas } from "./_components/ActiveDraftCanvas";
import { WorkspaceFooterBar } from "./_components/WorkspaceFooterBar";

export default function WorkspacePage() {
  const { activeDraftId, activeDraft } = useWorkspace();

  // Initial State: When NO draft is selected, show only PromptHeroStudio with NO header and NO footer
  if (!activeDraftId || !activeDraft) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center overflow-y-auto">
        <PromptHeroStudio />
      </main>
    );
  }

  // Active Draft State: Render Header, Canvas, and Footer
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
