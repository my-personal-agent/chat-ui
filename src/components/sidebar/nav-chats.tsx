"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChatItem } from "@/types/chat";
import { Dot, Ellipsis, Folder, Share, Trash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";

interface NavChatsProps {
  chats: ChatItem[];
  fetching: boolean;
}

export function NavChats({ chats, fetching }: NavChatsProps) {
  const { isMobile } = useSidebar();
  const { chatId } = useParams();

  // Memoize sorted chats to prevent unnecessary re-sorting
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      if (!a.timestamp) return -1;
      if (!b.timestamp) return 1;
      return b.timestamp - a.timestamp;
    });
  }, [chats]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        {sortedChats.map((chat) => {
          const isActive = chat.id === chatId;

          return (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                disabled={chat.isProcessing ?? false}
              >
                {chat.isProcessing ?? false ? (
                  <div className="flex items-center space-x-0.5">
                    <Dot className="animate-bounce [animation-delay:-0.2s]" />
                    <Dot className="animate-bounce [animation-delay:0s]" />
                    <Dot className="animate-bounce [animation-delay:0.2s]" />
                  </div>
                ) : (
                  <Link href={chat.url}>
                    <span>{chat.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
              {chat.isProcessing !== true && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                      showOnHover
                      className="data-[state=open]:bg-accent rounded-sm"
                    >
                      <Ellipsis />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-24 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <Folder />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      <Trash />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          );
        })}
        {fetching && (
          <SidebarMenuItem>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200]" />
              <Skeleton className="h-4 w-[150]" />
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
