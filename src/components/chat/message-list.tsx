"use client";

import { MessageBubble } from "@/components/chat/message";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "@/types/chat";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const UserSkeletonMessage = () => (
  <div className="flex justify-end">
    <div className="flex items-center space-x-4">
      <div className="space-y-2 text-right">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px] ml-12" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

const SystemOrBotSkeletonMessage = () => (
  <div className="flex justify-start">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  </div>
);

interface MessageListProps {
  isNew: boolean;
  messages: ChatMessage[];
  showLoading: boolean;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  fetching: boolean;
}

export function MessageList({
  isNew,
  messages,
  showLoading,
  loadMore,
  hasMore,
  fetching,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const fetchingRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Memoize sorted messages to prevent unnecessary re-sorting
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return a.timestamp - b.timestamp;
    });
  }, [messages]);

  // Scroll to bottom when new messages arrive (but only if user is near bottom)
  useEffect(() => {
    if (isInitialLoadRef.current || shouldAutoScroll) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      isInitialLoadRef.current = false;
    }
  }, [sortedMessages, shouldAutoScroll]);

  // Check if user is near bottom to determine auto-scroll behavior
  const checkIfNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const threshold = 100; // pixels from bottom
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;

    setShouldAutoScroll(isNearBottom);
    return isNearBottom;
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;

    if (!container || fetchingRef.current || !hasMore) return;

    const currentScrollTop = container.scrollTop;
    const isScrollingUpward = currentScrollTop < lastScrollTopRef.current;

    // Check if near bottom for auto-scroll behavior
    checkIfNearBottom();

    lastScrollTopRef.current = currentScrollTop;

    // Load more when scrolling up and near the top
    if (
      currentScrollTop < 100 &&
      isScrollingUpward &&
      currentScrollTop >= 0 &&
      !fetchingRef.current
    ) {
      fetchingRef.current = true;

      // Store current scroll position to maintain it after loading
      const scrollHeight = container.scrollHeight;

      loadMore()
        .then(() => {
          // Maintain scroll position after loading new messages
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop =
                newScrollHeight - scrollHeight + currentScrollTop;
            }
          });
        })
        .finally(() => {
          setTimeout(() => {
            fetchingRef.current = false;
          }, 500);
        });
    }
  }, [hasMore, loadMore, checkIfNearBottom]);

  // Sync loading state with ref
  useEffect(() => {
    fetchingRef.current = fetching;
  }, [fetching]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Loading indicator at top when loading more messages */}
        {!isNew && sortedMessages.length == 0 && (
          <>
            <UserSkeletonMessage />
            <SystemOrBotSkeletonMessage />
          </>
        )}

        {fetching &&
          sortedMessages.length > 0 &&
          sortedMessages[0].role == "user" && <SystemOrBotSkeletonMessage />}

        {fetching &&
          sortedMessages.length > 0 &&
          sortedMessages[0].role != "user" && <UserSkeletonMessage />}

        {isNew && !showLoading && sortedMessages.length === 0 && (
          <WelcomeScreen />
        )}

        {sortedMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {showLoading && <SystemOrBotSkeletonMessage />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
