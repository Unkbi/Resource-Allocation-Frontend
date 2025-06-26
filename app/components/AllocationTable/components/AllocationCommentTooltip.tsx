"use client"

import type React from "react"
import { useState, useRef, useMemo } from "react"
import { Tooltip, Box, styled, PopperProps } from "@mui/material"
import { Comment as CommentIcon } from "@mui/icons-material"
import "../styles/AllocationGrid.css"
import { Instance } from '@popperjs/core';

const CommentIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: -2,
  right: -1,
  width: 0,
  height: 0,
  borderLeft: "8px solid transparent",
  borderTop: "8px solid #E16F6F",
  cursor: "pointer",
  zIndex: 1,
  "&:hover": {
    borderTop: "8px solid #E16F6F",
  },
}))

const CommentTooltipContent = styled(Box)(({ theme }) => ({
  maxWidth: 300,
  minWidth: 150,
  padding: theme.spacing(1),
  backgroundColor: "#FFFFFF",
  border: "1px solid #E0E0E0",
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
  fontSize: "10px",
  lineHeight: 1.4,
  color: "#000000",
}))

const CommentHeader = styled(Box)(({ theme }) => ({
    width: 60,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    fontSize: "10px",
    fontWeight: 500,
    color: "#FFFFFF",
    backgroundColor: "#C76C6C",
}))

interface CommentTooltipProps {
  notes: string
  children: React.ReactNode
}

export const CommentTooltip: React.FC<CommentTooltipProps> = ({ notes, children }) => {
  const [open, setOpen] = useState(false)
  const positionRef = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const popperRef = useRef<Instance>(null);
  const areaRef = useRef<HTMLDivElement>(null);

const handleMouseMove = (event: React.MouseEvent) => {
    positionRef.current = { x: event.clientX, y: event.clientY };

    if (popperRef.current != null) {
      popperRef.current.update();
    }
  };
//   if (!notes || notes.trim() === "") {
//     return <>{children}</>
//   }

const popperProps: PopperProps = useMemo(() => ({
    // interactive: "true",
    popperRef,
    open,
    anchorEl: areaRef.current,
    modifiers: [
      {
        name: 'offset',
        options: { offset: [50, -5] },
      },
    ],
  }), [open]);

  return (
    <div >
    <Tooltip
      title={
        <CommentTooltipContent>
          <CommentHeader>
            Comment
          </CommentHeader>
          <Box>{notes}</Box>
        </CommentTooltipContent>
      }
      arrow
      placement="top-end"
      enterDelay={300}
      leaveDelay={100}
      followCursor
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "transparent",
            padding: 0,
            maxWidth: "none",
          },
        },
        arrow: {
          sx: {
            color: "#FFFFFF",
            "&::before": {
              border: "1px solid #E0E0E0",
            },
          },
        },
        popper: popperProps
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
        ref={areaRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        { <CommentIndicator />}
      </Box>
    </Tooltip>
    <div className="allocation-cell-content">{children}</div>
    </div>
  )
}
