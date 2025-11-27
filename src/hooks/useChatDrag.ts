'use client';

import { useCallback, useRef } from 'react';
import { useChatStore, type Position } from './useChatStore';

export interface UseChatDragProps {
  isMobile: boolean;
  isMinimized: boolean;
}

export function useChatDrag({ isMobile, isMinimized }: UseChatDragProps) {
  const {
    position,
    isDragging,
    dragOffset,
    setPosition,
    setIsDragging,
    setDragOffset,
  } = useChatStore();

  const headerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node) || isMobile) return;

      const rect = chatRef.current?.getBoundingClientRect();
      if (!rect) return;

      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [isMobile, setIsDragging, setDragOffset]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || isMobile) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const maxX = window.innerWidth - (isMobile ? 0 : 800);
      const maxY = window.innerHeight - (isMinimized ? 60 : 600);

      requestAnimationFrame(() => {
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      });
    },
    [isDragging, dragOffset, isMinimized, isMobile, setPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    headerRef,
    chatRef,
  };
}
