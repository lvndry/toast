import { MobileSidebar, Sidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden dashboard-bg">
      {/* Glass Sidebar */}
      <aside className="hidden h-full w-72 glass-sidebar md:block">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Glass Header */}
        <header className="glass-header flex h-16 items-center justify-between px-6 z-10">
          <MobileSidebar />
          <div className="flex w-full items-center justify-end gap-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <div className="h-8 w-px bg-border/50 hidden md:block" />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox:
                    "h-9 w-9 ring-2 ring-primary/10 hover:ring-primary/30 transition-all duration-300",
                },
              }}
            />
          </div>
        </header>

        {/* Content with subtle pattern */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-6 md:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
