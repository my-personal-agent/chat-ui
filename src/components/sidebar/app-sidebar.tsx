"use client";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/stores/chatsStore";
import { Bot } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { NavChats } from "./nav-chats";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { chats, loadChats, fetching, hasMore } = useChatStore();
  const sidebarContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleScroll = useCallback(() => {
    const element = sidebarContentRef.current;
    if (!element || fetching || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const threshold = 10; // pixels from bottom to trigger load more

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadChats();
    }
  }, [fetching, hasMore, loadChats]);

  useEffect(() => {
    const element = sidebarContentRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" passHref>
                <Bot className="!size-5" />
                <span className="text-base font-semibold">My Personal AI</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent ref={sidebarContentRef} className="overflow-y-auto">
        <NavMain />
        <NavChats chats={chats} fetching={fetching} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
