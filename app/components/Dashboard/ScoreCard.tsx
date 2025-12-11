"use client"
import { Card, Box, Typography, CircularProgress, Grid, Stack, Tooltip } from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp"
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown"
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';

interface SubScore {
  score: number
  label: string
  tooltipText?: string
  change: number
  positive?: boolean
}

interface MuiDashboardCardProps {
  title: string
  tooltipText?: string
  overallScore: number
  overallChange: number
  overallDirection?: string
  subScores: SubScore[]
  hasAccess?: boolean
}

export default function MuiDashboardCard({
  title,
  tooltipText,
  overallScore,
  overallChange,
  overallDirection,
  subScores,
  hasAccess = true,
}: MuiDashboardCardProps) {

  const colorPallette = ['#00A63E', '#9810FA', '#155DFC'];

  return (
    <>

      {/* Header with title and tooltip */}
      <Box
        sx={{

          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: 600, color: "#333" }}>
          {title}{' '}
          <span
            style={{
              fontSize: "14px",
              color: 'rgba(0, 0, 0, 0.6)',
              fontWeight: 400,
            }}
          >
            (Previous week)
          </span>
        </Typography>
        {tooltipText && (
          <Tooltip title={tooltipText}>
            <InfoIcon sx={{ fontSize: "16px", color: "#999" }} />
          </Tooltip>
        )}
      </Box>

      {/* Overall Score Section - Navy Blue */}
      <Box
        sx={{
          background: "#1e3a8a",
          p: 3,
          display: "flex",
          borderRadius: '4px',
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            {title === 'Engagement Overview' ? 'Overall Engagement' : 'Overall Score'}
          </Typography>
        </Box>

        {/* Score and Trend Indicator on Right */}
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Stack direction="row" alignItems="baseline" gap={0.5}>
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {Number(overallScore).toFixed(1)}
            </Typography>
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: "18px",
                opacity: 0.9,
                lineHeight: 1,
              }}
            >
              /100
            </Typography>
          </Stack>

          {/* Trend Icon and Change */}
          <Stack direction="row" alignItems="center" gap={0.3}>
            {overallChange === 0 ? (
              <ArrowCircleRightOutlinedIcon
                sx={{
                  fontSize: "18px",
                  color: "#9ca3af",
                }}
              />
            ) : overallDirection !== "down" ? (
              <ArrowCircleUpIcon
                sx={{
                  fontSize: "18px",
                  color: "#00A63E",
                }}
              />
            ) : (
              <ArrowCircleDownIcon
                sx={{
                  fontSize: "18px",
                  color: "#ef4444",
                }}
              />

            )}
            <Typography
              sx={{
                color: overallChange === 0 ? "#ffffff" : (overallDirection !== "down" ? "#00A63E" : "#ef4444"),
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {Number(overallChange).toFixed(1)}%
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Sub Scores Section - Grey Background */}
      <Box sx={{ backgroundColor: "#ffffff" }}>
        <Grid container spacing={2}>
          {subScores.map((subScore, index) => (
            <Grid item xs={12} sm={6} md={subScores.length === 3 ? 4 : 6} key={index} sx={{ mt: 2 }}>
              <Card
                sx={{
                  p: 1.5,
                  // minWidth: "250px",
                  height: "100%",
                  backgroundColor: "#f5f5f5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {/* Left side - Label, Score, Change */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#666",
                      mb: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    {subScore.label}{' '}
                    {subScore.tooltipText && (
                    <Tooltip title={subScore.tooltipText}>
                      <InfoIcon sx={{ fontSize: "12px", color: "#999" }} />
                    </Tooltip>
                  )}
                  </Typography>
                  
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: colorPallette[index % colorPallette.length],
                      }}
                    >
                      {Number(subScore.score).toFixed(1)}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={0.25}>
                      {subScore.change === 0 ? (
                        <ArrowCircleRightOutlinedIcon
                          sx={{
                            fontSize: "16px",
                            color: "#9ca3af",
                          }}
                        />
                      ) : subScore.positive !== false ? (
                        <ArrowCircleUpIcon
                          sx={{
                            fontSize: "16px",
                            color: "#00A63E",
                          }}
                        />
                      ) : (
                        <ArrowCircleDownIcon
                          sx={{
                            fontSize: "16px",
                            color: "#ef4444",
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: subScore.change === 0 ? "#9ca3af" : (subScore.positive !== false ? "#00A63E" : "#ef4444"),
                          fontWeight: 600,
                        }}
                      >
                        {Number(subScore.change).toFixed(1)}%
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* Right side - Circular Progress */}
                <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
                  {/* Background circle (grey) */}
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={60}
                    thickness={4}
                    sx={{
                      color: "#e5e7eb",
                      position: "absolute",
                    }}
                  />
                  {/* Foreground circle (colored progress) */}
                  <CircularProgress
                    variant="determinate"
                    value={subScore.score}
                    size={60}
                    thickness={4}
                    sx={{
                      color: "#6366f1",
                      "& .MuiCircularProgress-circle": {
                        strokeLinecap: "round",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {Number(subScore.score).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
    // </Card>
  )
}
