import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex h-[3rem] shrink-0 items-center bg-background px-4 lg:px-6">
      {/* Left icon (menu/sidebar trigger) */}
      <div className="flex items-center">
        <SidebarTrigger />
      </div>

      {/* Right icon (mode toggle) */}
      <div className="ml-auto flex items-center">
        <ModeToggle />
      </div>
    </header>
  );
}
