import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

