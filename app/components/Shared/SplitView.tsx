'use client';

import React, { useRef, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

interface HorizontalSplitViewProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  initialTopHeight?: number;
  minTopHeight?: number;
  maxTopHeight?: number;
  syncHorizontalScroll?: boolean;
  classNameTop?: string;
  classNameBottom?: string;
  topCSSHeight?: string | null;
}

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 31px)',
  width: '100%',
  overflow: 'hidden',
});

const TopPanel = styled('div')<{ height: string | number }>(({ height }) => ({
  height,
  overflow: 'auto',
  flexShrink: 0,
  background: '#fff',
  zIndex :'100',
}));

const Resizer = styled('div')(({ theme }) => ({
  height: '6px',
  backgroundColor: theme.palette.divider,
  cursor: 'row-resize',
  zIndex: 50,
  position: 'relative',
  flexShrink: 0,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
}));

const BottomPanel = styled('div')({
  flex: 1,
  overflow: 'auto',
  position: 'relative',
});

const getScrollTarget = (panel: HTMLDivElement | null): HTMLElement | null => {
  if (!panel) return null;

  return (
    panel.querySelector('[data-scroll-sync-target]') || // explicit opt-in
    panel.querySelector('.MuiDataGrid-virtualScroller') || // built-in MUI support
    panel // fallback to panel itself
  );
};

const HorizontalSplitView: React.FC<HorizontalSplitViewProps> = ({
  top,
  bottom,
  initialTopHeight = 300,
  minTopHeight = 100,
  maxTopHeight = 700,
  syncHorizontalScroll = false,
  classNameTop = '',
  classNameBottom = '',
  topCSSHeight = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [topHeight, setTopHeight] = useState<number>(initialTopHeight);
  const isDraggingRef = useRef<boolean>(false);
  const isSyncingRef = useRef<boolean>(false);
  const [topScroll, setTopScroll] = useState<HTMLElement | null>(null);
  const [bottomScroll, setBottomScroll] = useState<HTMLElement | null>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none'; // 👈 prevent text selection
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const containerTop = containerRef.current.getBoundingClientRect().top;
    let newHeight = e.clientY - containerTop;
    if (newHeight < minTopHeight) newHeight = minTopHeight;
    if (newHeight > maxTopHeight) newHeight = maxTopHeight;
    setTopHeight(newHeight);
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = ''; // 👈 re-enable text selection
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setTopScroll(getScrollTarget(topRef.current));
      setBottomScroll(getScrollTarget(bottomRef.current));
    }, 0);
  }, []);

  // 💡 General scroll sync logic
  useEffect(() => {
    if (!syncHorizontalScroll) return;
    if (!topScroll || !bottomScroll) return;

    const handleTopScroll = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      bottomScroll.scrollLeft = topScroll.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    };

    const handleBottomScroll = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      topScroll.scrollLeft = bottomScroll.scrollLeft;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    };

    topScroll.addEventListener('scroll', handleTopScroll);
    bottomScroll.addEventListener('scroll', handleBottomScroll);

    return () => {
      topScroll.removeEventListener('scroll', handleTopScroll);
      bottomScroll.removeEventListener('scroll', handleBottomScroll);
    };
  }, [syncHorizontalScroll, topScroll, bottomScroll]);

  return (
    <Container ref={containerRef}>
      <TopPanel
        ref={topRef}
        height={topCSSHeight ?? topHeight}
        className={classNameTop}
      >
        {top}
      </TopPanel>
      <Resizer onMouseDown={handleMouseDown} />
      <BottomPanel ref={bottomRef} className={classNameBottom}>
        {bottom}
      </BottomPanel>
    </Container>
  );
};

export default HorizontalSplitView;
