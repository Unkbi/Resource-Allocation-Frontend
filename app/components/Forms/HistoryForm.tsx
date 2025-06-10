import React, {useState,useMemo} from "react"
import { Box, Typography, Avatar, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Button } from "@mui/material"

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

// Hash function to convert string to number
const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

const getAvatarColorHSL = (initials: string) => {
  const hash = hashString(initials)

  // Generate hue based on hash (0-360 degrees)
  const hue = hash % 360

  // Use consistent saturation and lightness for good readability
  const saturation = 65 + (hash % 20) // 65-85%
  const lightness = 85 + (hash % 10) // 85-95% for background
  const textLightness = 25 + (hash % 20) // 25-45% for text

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    color: `hsl(${hue}, ${saturation + 10}%, ${textLightness}%)`,
  }
}

const INITIAL_ITEMS_COUNT = 5

export default function HistoryForm({historyData}: {historyData: ActivityItem[]}) {

  const [showAll, setShowAll] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)

  // Calculate items to display based on showAll state
  const displayedItems = useMemo(() => {
    if (showAll) {
      return historyData
    }
    return historyData.slice(0, INITIAL_ITEMS_COUNT)
  }, [historyData, showAll])

  const hasMoreItems = historyData.length > INITIAL_ITEMS_COUNT
  const remainingCount = historyData.length - INITIAL_ITEMS_COUNT

  const handleViewAllClick = async () => {
    setIsExpanding(true)
    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 100))
    setShowAll(true)
    setIsExpanding(false)
  }

  const handleViewLessClick = () => {
    setShowAll(false)
    // Scroll to top of the list smoothly
    document.querySelector("[data-activity-list]")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 600, bgcolor: "background.paper" }}>
      <List sx={{ padding: 0 }} data-activity-list >
        {displayedItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem
              sx={{
                alignItems: "flex-start",
                padding: "2% 1%",
                "&:hover": {
                  backgroundColor: "#FAFAFA",
                },
                opacity: isExpanding && index >= INITIAL_ITEMS_COUNT ? 0 : 1,
                transition: "opacity 0.3s ease-in-out",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: "14px",
                    fontWeight: 600,
                    ...getAvatarColorHSL(item.userInitials),
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
                        marginBottom: "4px",
                      }}
                    >
                      {item.timestamp}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 400,
                        color: "#16171A",
                        lineHeight: 1.4,
                        fontSize: "14px",
                      }}
                    >
                      {item.userName} | {item.projectName}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#16171A",
                        fontSize: "14px",
                        lineHeight: 1.4,
                        marginTop: "2px",
                      }}
                    >
                       for week {item.weekNumber} (<span style={{ color: '#1469F7' }}>{item.date}</span>)
                      {item.fromVersion && item.toVersion && (
                        <span>
                          {" "}
                          from <strong>{item.fromVersion}</strong> to <strong>{item.toVersion}</strong>
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

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  marginLeft: "16px",
                }}
              >
                <Chip
                  label={item.action}
                  size="small"
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    height: "24px",
                    marginBottom: "8px",
                    borderRadius: "8px",
                    ...getStatusColor(item.action),
                  }}
                />

                {item.byUser && (
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6E6E6F",
                        fontSize: "11px",
                        fontStyle: "italic",
                      }}
                    >
                      by
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6E6E6F",
                        fontSize: "11px",
                        display: "block",
                        fontWeight: 500,
                      }}
                    >
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

      {/* View All History Button */}
      {hasMoreItems && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "16px",
            borderTop: showAll ? "none" : "1px solid #E0E0E0",
          }}
        >
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
                "&:hover": {
                  borderColor: "#B0B0B0",
                  backgroundColor: "#FAFAFA",
                },
                "&:disabled": {
                  opacity: 0.6,
                },
                transition: "all 0.2s ease-in-out",
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
                "&:hover": {
                  backgroundColor: "#FAFAFA",
                },
                transition: "all 0.2s ease-in-out",
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
