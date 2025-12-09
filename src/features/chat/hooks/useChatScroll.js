import { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";

/**
 * Hook to manage scroll behavior in a chat list.
 * Handles:
 * - Auto-scroll to bottom on mount
 * - Auto-scroll to bottom when new messages arrive (if already at bottom)
 * - Preserving scroll position when loading older messages
 * - Showing/hiding "Scroll to Bottom" button
 * 
 * @param {Array} messages - List of messages
 * @param {boolean} hasMore - Whether there are more messages to load
 * @param {boolean} loading - Loading state
 * @param {Function} onLoadMore - Callback to load older messages
 * @returns {Object} { containerRef, messagesEndRef, showScrollButton, scrollToBottom, handleScroll }
 */
export function useChatScroll({ messages, hasMore, loading, onLoadMore }) {
    const containerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const lastScrollTop = useRef(0);

    // State
    const [hasInitialScroll, setHasInitialScroll] = useState(false); // Has updated to local state mostly for strict mode safety
    const [readyToShow, setReadyToShow] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Helper ref to anchor scroll position when prepending messages
    const scrollAdjustRef = useRef({
        pending: false,
        prevScrollBottomOffset: 0,
    });

    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
            setShowScrollButton(false);
        }
    }, []);

    // Handle scroll events: Detect "near top", load more, and show/hide scroll button
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        // Detect scroll direction (optional, but good for UX)
        const isScrollingUp = scrollTop < lastScrollTop.current;
        lastScrollTop.current = scrollTop;

        // Show button if not at bottom and we have enough content
        const atBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
        setShowScrollButton(!atBottom && messages.length > 10);

        // Load more logic: user scrolls UP near the top (<= 50px)
        if (isScrollingUp && scrollTop <= 50 && hasMore && !loading && onLoadMore) {
            const prevScrollBottomOffset = scrollHeight - scrollTop;

            scrollAdjustRef.current = {
                pending: true,
                prevScrollBottomOffset,
            };

            onLoadMore();
        }
    }, [hasMore, loading, messages.length, onLoadMore]);

    // Initial Scroll: Scroll to bottom immediately when messages are first loaded
    useLayoutEffect(() => {
        if (!hasInitialScroll && messages.length > 0 && containerRef.current) {
            scrollToBottom();
            setHasInitialScroll(true);
            setReadyToShow(true);
        }
    }, [messages.length, hasInitialScroll, scrollToBottom]);

    // Handle updates (new messages or loaded old messages)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Case 1: We just loaded older messages (Prepended)
        if (scrollAdjustRef.current.pending) {
            const { prevScrollBottomOffset } = scrollAdjustRef.current;
            // Restore position relative to bottom
            container.scrollTop = container.scrollHeight - prevScrollBottomOffset;
            scrollAdjustRef.current.pending = false;
        } else {
            // Case 2: New message appended
            // If user was already near bottom (or if it's the very first load which is handled above), scroll to bottom.
            // But standard behavior: if I sent it, or if I'm at the bottom, auto-scroll.
            // We'll use a simple heuristic: if we are near bottom, stay at bottom.
            // Note: This logic can be refined based on "isOwnMessage" if passed down.

            const { scrollTop, scrollHeight, clientHeight } = container;
            const distFromBottom = scrollHeight - scrollTop - clientHeight;
            const wasNearBottom = distFromBottom < 150; // Tolerance

            if (wasNearBottom) {
                scrollToBottom();
            }
        }
    }, [messages, scrollToBottom]);

    return {
        containerRef,
        messagesEndRef,
        showScrollButton,
        readyToShow,
        scrollToBottom,
        handleScroll
    };
}
