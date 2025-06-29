"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

interface NavChatsProps {
  chats: ChatItem[];
  fetching: boolean;
  onDeleteChat?: (chatId: string) => Promise<void> | void;
}

export function NavChats({ chats, fetching, onDeleteChat }: NavChatsProps) {
  const { isMobile } = useSidebar();
  const { chatId } = useParams();
  const router = useRouter();
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<ChatItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Memoize sorted chats to prevent unnecessary re-sorting
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      if (!a.timestamp) return -1;
      if (!b.timestamp) return 1;
      return b.timestamp - a.timestamp;
    });
  }, [chats]);

  const handleDeleteClick = (chat: ChatItem) => {
    setChatToDelete(chat);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete || !onDeleteChat) return;

    try {
      setDeletingChatId(chatToDelete.id);
      setShowDeleteDialog(false);

      // Call the delete function
      await onDeleteChat(chatToDelete.id);

      // If the deleted chat is currently active, navigate to home
      if (chatToDelete.id === chatId) {
        router.push("/");
      }

      toast.info("Chat has been deleted.");
    } catch {
      toast.error("Failed to delete chat.");
    } finally {
      setDeletingChatId(null);
      setChatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setChatToDelete(null);
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarMenu>
          {sortedChats.map((chat) => {
            const isActive = chat.id === chatId;
            const isDeleting = deletingChatId === chat.id;

            return (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  disabled={chat.isProcessing ?? (false || isDeleting)}
                >
                  {chat.isProcessing ?? (false || isDeleting) ? (
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
                {chat.isProcessing !== true && !isDeleting && (
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
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDeleteClick(chat)}
                      >
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{chatToDelete?.title}&quot;?
              This action cannot be undone and will permanently delete the chat
              and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
