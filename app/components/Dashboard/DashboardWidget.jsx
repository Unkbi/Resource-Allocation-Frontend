"use client"

import { Paper, Box, IconButton } from "@mui/material"
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { useRef, useState, useEffect } from "react"

const DashboardWidget = ({ children, onClick, minWidth = 300, minHeight = 300, autoHeight = false, showNoData = false, noDataMessage = 'No data available', noDataIcon = null }) => {
  const mouseDownPosition = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current
        setDimensions({
          width: Math.max(offsetWidth, minWidth),
          height: Math.max(offsetHeight, minHeight),
        })
      }
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [minWidth, minHeight])
  
  const chartContent = typeof children === "function" ? children(dimensions) : children;

  return (
    <Box
      ref={containerRef}
      sx={{
        height: autoHeight ? "fit-content" : "100%",
        width: "100%",
        userSelect: "none",
        minWidth: `${minWidth}px`,
        minHeight: autoHeight ? "fit-content" : `${minHeight}px`,
        position: 'relative',
      }}
    >
      {/* Drag Handle - only this area triggers dragging */}
      <Box
        className="drag-handle"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          borderTopLeftRadius: '4px',
          borderTopRightRadius: '4px',
          '&:hover': {
            opacity: 1,
          },
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <DragIndicatorIcon sx={{ color: 'rgba(0, 0, 0, 0.4)', fontSize: 20 }} />
      </Box>
      <Paper
        elevation={3}
        onClick={onClick}
        sx={{
          p: 2,
          height: autoHeight ? "fit-content" : "100%",
          boxSizing: "border-box",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: onClick ? "pointer" : "default",
          position: 'relative',
          // overflow: "hidden",
        }}
      >
        {showNoData ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Fallback message when no data */}
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              {noDataIcon ? (
                // Render custom icon if provided
                (typeof noDataIcon === 'function' ? noDataIcon({ sx: { fontSize: 56, color: '#9CA3AF', mb: 1 } }) : null)
              ) : null}
              <span style={{ fontSize: 14 }}>{noDataMessage}</span>
            </Box>
          </Box>
        ) : (
          chartContent
        )}
      </Paper>
    </Box>
  )
}

export default DashboardWidget
