"use client";

import { Message } from "@/components/chat/message";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SendConfrimation,
  StreamChatMessage,
  StreamChatMessageConfirmation,
} from "@/types/chat";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConfirmEmailSend } from "./confirm-emai-send";

const UserSkeletonMessage = () => (
  <div className="flex justify-end">
    <div className="flex flex-row-reverse items-center space-x-4 space-x-reverse">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px] ml-[50px]" />
      </div>
    </div>
  </div>
);

const SystemOrAssistantSkeletonMessage = () => (
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
  messages: StreamChatMessage[];
  showLoading: boolean;
  isStreaming: boolean;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  sendConfirmation: (msgId: string, approval: SendConfrimation) => void;
}

export function MessageList({
  isNew,
  messages,
  showLoading,
  isStreaming,
  loadMore,
  hasMore,
  sendConfirmation,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const fetchingRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Memoize sorted messages to prevent unnecessary re-sorting
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return a.timestamp - b.timestamp;
    });
  }, [messages]);

  // Robust scroll to bottom function
  const scrollToBottom = useCallback(
    (force = false) => {
      const container = containerRef.current;

      if (
        !container ||
        (!shouldAutoScroll && !force && !isInitialLoadRef.current)
      ) {
        return;
      }

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const performScroll = () => {
        if (!container) return;

        // Force scroll to absolute bottom
        container.scrollTop = container.scrollHeight;

        // Double-check after a small delay to handle dynamic content
        setTimeout(() => {
          if (
            container &&
            container.scrollTop <
              container.scrollHeight - container.clientHeight - 50
          ) {
            container.scrollTop = container.scrollHeight;
          }
        }, 50);
      };

      // Immediate scroll
      performScroll();

      // Delayed scroll to handle dynamic content rendering (like code blocks)
      scrollTimeoutRef.current = setTimeout(performScroll, 100);

      // Final scroll attempt for stubborn content
      setTimeout(performScroll, 300);
    },
    [shouldAutoScroll]
  );

  // Enhanced bottom detection
  const checkIfNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const threshold = 150; // Increased threshold for better detection
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < threshold;

    setShouldAutoScroll(isNearBottom);
    return isNearBottom;
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isInitialLoadRef.current || shouldAutoScroll) {
      scrollToBottom(true);
      isInitialLoadRef.current = false;
    }
  }, [sortedMessages, scrollToBottom, shouldAutoScroll]);

  // Enhanced scroll handler
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
              const newScrollTop =
                newScrollHeight - scrollHeight + currentScrollTop;
              container.scrollTop = Math.max(0, newScrollTop);
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Handle loading state changes
  useEffect(() => {
    if (showLoading && shouldAutoScroll) {
      // Small delay to ensure loading skeleton is rendered
      setTimeout(() => scrollToBottom(true), 50);
    }
  }, [showLoading, scrollToBottom, shouldAutoScroll]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scroll-smooth"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Loading indicator at top when loading more messages */}
        {!isNew && sortedMessages.length == 0 && (
          <>
            <UserSkeletonMessage />
            <SystemOrAssistantSkeletonMessage />
          </>
        )}

        {isNew && showLoading && sortedMessages.length == 0 && (
          <>
            <UserSkeletonMessage />
          </>
        )}

        {isNew && !showLoading && sortedMessages.length === 0 && (
          <WelcomeScreen />
        )}

        {sortedMessages.map((message) => {
          if (message.role === "confirmation") {
            const confirmation =
              message.content as StreamChatMessageConfirmation;

            if (
              confirmation.name === "send_gmail" ||
              confirmation.name === "transfer_to_google_agent"
            ) {
              return (
                <ConfirmEmailSend
                  sendConfirmation={sendConfirmation}
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming}
                />
              );
            }
          }

          return <Message key={message.id} message={message} />;
        })}

        {/* Typing indicator */}
        {showLoading && sortedMessages.length > 0 && (
          <SystemOrAssistantSkeletonMessage />
        )}

        {/* Scroll anchor - positioned to ensure proper scrolling */}
        <div
          ref={messagesEndRef}
          className="h-1 w-full"
          style={{ minHeight: "1px" }}
        />
      </div>
    </div>
  );
}
