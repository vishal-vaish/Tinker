import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { WorkspaceProvider } from "@/providers/WorkspaceProvider";
import { WorkspaceSidebar } from "./workspace/_components/WorkspaceSidebar";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
          {/* Left Shadcn Sidebar */}
          <WorkspaceSidebar />

          {/* Main Workspace Viewport */}
          <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden p-0 m-0 rounded-none border-0">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
