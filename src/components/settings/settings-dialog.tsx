"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Settings, Unplug, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Connectors } from "./connectors";

const data = {
  general: { title: "General", icon: Settings, content: <div></div> },
  connectors: {
    title: "Connectors",
    icon: Unplug,
    content: <Connectors />,
  },
  account: { title: "Account", icon: User, content: <div></div> },
};

interface SettingsDialog {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ isOpen, onOpenChange }: SettingsDialog) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const showSettings = searchParams.get("settings") === "true";
    if (showSettings) {
      const tab = searchParams.get("tab");
      if (tab && tab in data) {
        setActiveTab(tab);
      }
    }
  }, [searchParams]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[600px] lg:max-w-[700px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar
            collapsible="none"
            className="hidden md:flex w-[calc(var(--sidebar-width-icon)+140px)]! "
          >
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {Object.entries(data).map(([key, value]) => (
                      <SidebarMenuItem key={key}>
                        <SidebarMenuButton
                          asChild
                          isActive={key === activeTab}
                          onClick={() => setActiveTab(key)}
                        >
                          <div className="cursor-pointer">
                            <value.icon />
                            <span>{value.title}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            {data[activeTab as keyof typeof data].content}
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
