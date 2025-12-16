"use client"

import { Paper, Box } from "@mui/material"
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

  const handleMouseDown = (event) => {
    mouseDownPosition.current = { x: event.clientX, y: event.clientY }
  }

  return (
    <Box
      ref={containerRef}
      onMouseDown={handleMouseDown}
      sx={{
        cursor: "pointer",
        height: autoHeight ? "fit-content" : "100%",
        width: "100%",
        userSelect: "none",
        minWidth: `${minWidth}px`,
        minHeight: autoHeight ? "fit-content" : `${minHeight}px`,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          height: autoHeight ? "fit-content" : "100%",
          boxSizing: "border-box",
          width: "100%",
          display: "flex",
          flexDirection: "column",
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
          typeof children === "function" ? children(dimensions) : children
        )}
      </Paper>
    </Box>
  )
}

export default DashboardWidget
