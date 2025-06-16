"use client"

import { useState, useEffect } from "react"

export const useResponsiveChart = (containerDimensions, chartType = "default") => {
  const [chartConfig, setChartConfig] = useState({})

  useEffect(() => {
    const { width, height } = containerDimensions

    // Base configurations for different chart types
    const configs = {
      pie: {
      width: Math.max(width - 40, 450),
      height: Math.max(height - 80, 300),
      outerRadius: Math.min((width - 100) / 3, (height - 120) / 3, 100),
      legend: {
        direction: width < 400 ? "column" : "row",
        position: {
        vertical: "bottom",
        horizontal: width < 400 ? "left" : "middle",
        },
        itemmarkwidth: width < 400 ? 16 : 20,
        itemmarkheight: width < 400 ? 12 : 16,
        labelstyle: { fontSize: width < 400 ? 11 : 13 },
        padding: width < 400 ? 4 : 8,
      },
      },
      bar: {
      width: Math.max(width - 40, 280),
      height: Math.max(height - 80, 200),
      margin: {
        left: width < 400 ? 40 : 60,
        right: width < 400 ? 10 : 20,
        top: 20,
        // bottom: width < 400 ? 60 : 80,
      },
      legend: {
        direction: "row",
        position: { vertical: "bottom", horizontal: "middle" },
        padding: width < 400 ? 4 : 8,
      },
      xAxis: {
        labelStyle: { fontSize: width < 400 ? 10 : 12 },
        tickLabelStyle: { fontSize: width < 400 ? 9 : 11 },
      },
      yAxis: {
        width: width < 400 ? 40 : 60,
        labelStyle: { fontSize: width < 400 ? 10 : 12 },
      },
      },
      line: {
      width: Math.max(width - 40, 280),
      height: Math.max(height - 80, 200),
      margin: {
        left: width < 400 ? 40 : 60,
        right: width < 400 ? 10 : 20,
        top: 20,
        // bottom: width < 400 ? 60 : 80,
      },
      legend: {
        direction: "row",
        position: { vertical: "bottom", horizontal: "middle" },
        padding: width < 400 ? 4 : 8,
      },
      },
    }

    setChartConfig(configs[chartType] || configs.default || {})
  }, [containerDimensions, chartType])

  return chartConfig
}

// Utility function to truncate long labels
export const truncateLabel = (label, maxLength = 20) => {
  if (!label || typeof label !== "string") return label
  return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label
}

// Utility function to format team names for charts
export const formatTeamName = (teamName, maxLength = 10, itemCount = 1) => {
  if (!teamName || typeof teamName !== "string") return teamName

  // Adjust max length based on number of items
  const adjustedLength = itemCount > 4 ? Math.max(maxLength - 2, 10) : maxLength

  return teamName.length > adjustedLength && itemCount > 4 ? `${teamName.slice(0, adjustedLength)}${teamName.slice(adjustedLength)}` : teamName

}
