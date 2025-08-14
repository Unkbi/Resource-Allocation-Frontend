import React, { useState, useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Skeleton
} from "@mui/material"

interface ActivityItem {
  id: string
  userInitials: string
  userName: string
  projectName: string
  weekNumber: number
  date: string
  timestamp: string
  action: "Update" | "Deleted" | "Created"
  fromVersion?: string
  toVersion?: string
  updatedTo?: string
  byUser?: string
}

const getStatusColor = (action: string) => {
  switch (action) {
    case "Update":
      return { backgroundColor: "#F5B5441A", color: "#F5B544" }
    case "Deleted":
      return { backgroundColor: "#E6521F1A", color: "#E6521F" }
    case "Created":
      return { backgroundColor: "#2772F01A", color: "#2772F0" }
    default:
      return { backgroundColor: "#E2E3E5", color: "#383D41" }
  }
}

const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

const getAvatarColorHSL = (initials: string) => {
  const hash = hashString(initials)
  const hue = hash % 360
  const saturation = 65 + (hash % 20)
  const lightness = 85 + (hash % 10)
  const textLightness = 25 + (hash % 20)

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    color: `hsl(${hue}, ${saturation + 10}%, ${textLightness}%)`
  }
}

const INITIAL_ITEMS_COUNT = 5

export default function HistoryForm({ historyData, historyStatus }: { historyData: ActivityItem[], historyStatus: string }) {
  const [showAll, setShowAll] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)
  const displayedItems = useMemo(() => {
    if (showAll) return historyData
    return historyData.slice(0, INITIAL_ITEMS_COUNT)
  }, [historyData, showAll])
  const [isLoading, setIsLoading] = useState(true)
  const [showNoHistory, setShowNoHistory] = useState(false)

  const hasMoreItems = historyData.length > INITIAL_ITEMS_COUNT
  const remainingCount = historyData.length - INITIAL_ITEMS_COUNT

  const handleViewAllClick = async () => {
    setIsExpanding(true)
    await new Promise(resolve => setTimeout(resolve, 100))
    setShowAll(true)
    setIsExpanding(false)
  }

  const handleViewLessClick = () => {
    setShowAll(false)
    document.querySelector("[data-activity-list]")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    })
  }

  useEffect(() => {
    if (historyStatus === "no-data") {
        setIsLoading(false)
        setShowNoHistory(true)
    } else {
      setIsLoading(historyStatus !== "loaded")
      setShowNoHistory(false)
    }
  }, [historyData])

  if (showNoHistory) {
    return (
      <Box sx={{ width: "100%", maxWidth: 600, bgcolor: "background.paper", p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No history found.
        </Typography>
      </Box>
    )
  }
  const skeletonCount = 5

  return (
    <Box sx={{ width: "100%", maxWidth: 600, bgcolor: "background.paper" }}>
      <List sx={{ padding: 0 }} data-activity-list>
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, idx) => (
              <React.Fragment key={idx}>
                <ListItem sx={{ alignItems: "flex-start", padding: "2% 1%" }}>
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box>
                        <Skeleton width="30%" height={12} sx={{ mb: 1 }} />
                        <Skeleton width="60%" height={18} />
                        <Skeleton width="80%" height={16} sx={{ mt: 1 }} />
                      </Box>
                    }
                  />
                  <Box sx={{ minWidth: 64, ml: 2 }}>
                    <Skeleton width={50} height={24} />
                    <Skeleton width={50} height={12} sx={{ mt: 1 }} />
                  </Box>
                </ListItem>
                {idx < skeletonCount - 1 && <Divider sx={{ padding: "2% 0%" }} />}
              </React.Fragment>
            ))
          : displayedItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  sx={{
                    alignItems: "flex-start",
                    padding: "2% 1%",
                    "&:hover": { backgroundColor: "#FAFAFA" },
                    opacity: isExpanding && index >= INITIAL_ITEMS_COUNT ? 0 : 1,
                    transition: "opacity 0.3s ease-in-out"
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: "14px",
                        fontWeight: 600,
                        ...getAvatarColorHSL(item.userInitials)
                      }}
                    >
                      {item.userInitials}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    sx={{ margin: 0, flex: 1 }}
                    primary={
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9B9C9E",
                            fontSize: "10px",
                            fontWeight: 400,
                            display: "block",
                            marginBottom: "4px"
                          }}
                        >
                          {item.timestamp}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 400, color: "#16171A", fontSize: "14px" }}
                        >
                          {item.userName} | {item.projectName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#16171A",
                            fontSize: "14px",
                            marginTop: "2px"
                          }}
                        >
                          for week {item.weekNumber} (
                          <span style={{ color: "#1469F7" }}>{item.date}</span>)
                          {item.fromVersion && item.toVersion && (
                            <span>
                              {" "}
                              from <strong>{item.fromVersion}</strong> to{" "}
                              <strong>{item.toVersion}</strong>
                            </span>
                          )}
                          {item.updatedTo && !item.fromVersion && (
                            <span>
                              {" "}
                              updated to <strong>{item.updatedTo}</strong>
                            </span>
                          )}
                        </Typography>
                      </Box>
                    }
                  />

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", ml: 2 }}>
                    <Chip
                      label={item.action}
                      size="small"
                      sx={{
                        fontSize: "12px",
                        fontWeight: 500,
                        height: "24px",
                        marginBottom: "8px",
                        borderRadius: "8px",
                        ...getStatusColor(item.action)
                      }}
                    />
                    {item.byUser && (
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "#6E6E6F", fontSize: "11px", fontStyle: "italic" }}>
                          by
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6E6E6F", fontSize: "11px", display: "block", fontWeight: 500 }}>
                          {item.byUser}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </ListItem>
                {index < displayedItems.length - 1 && <Divider sx={{ padding: "2% 0%" }} />}
              </React.Fragment>
            ))}
      </List>

      {!isLoading && hasMoreItems && (
        <Box sx={{ display: "flex", justifyContent: "center", padding: "16px", borderTop: showAll ? "none" : "1px solid #E0E0E0" }}>
          {!showAll ? (
            <Button
              variant="outlined"
              onClick={handleViewAllClick}
              disabled={isExpanding}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "14px",
                padding: "10px 24px",
                borderColor: "#1C2D5F80",
                color: "#1C2D5F",
                backgroundColor: "transparent",
                "&:hover": { borderColor: "#B0B0B0", backgroundColor: "#FAFAFA" },
                "&:disabled": { opacity: 0.6 },
                transition: "all 0.2s ease-in-out"
              }}
            >
              {isExpanding ? "Loading..." : `VIEW ALL HISTORY (${remainingCount} more)`}
            </Button>
          ) : (
            <Button
              variant="text"
              onClick={handleViewLessClick}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "14px",
                padding: "10px 24px",
                color: "#616161",
                "&:hover": { backgroundColor: "#FAFAFA" },
                transition: "all 0.2s ease-in-out"
              }}
            >
              VIEW LESS
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
}
