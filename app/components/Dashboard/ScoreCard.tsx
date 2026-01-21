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

// Health interpretation bands with color schemes
const getScoreColors = (score: number) => {
  if (score >= 90) {
    return {
      background: '#e8f5e9',
      number: '#2E7D32',
      indicator: '#4CAF50',
      level: 'Excellent'
    };
  } else if (score >= 75) {
    return {
      background: '#F1F8E9',
      number: '#558B2F',
      indicator: '#8BC34A',
      level: 'Good'
    };
  } else if (score >= 60) {
    return {
      background: '#FFF8E1',
      number: '#F9A825',
      indicator: '#FFC107',
      level: 'Attention Needed'
    };
  } else if (score >= 40) {
    return {
      background: '#FFF3E8',
      number: '#EF6C00',
      indicator: '#FF9800',
      level: 'At Risk'
    };
  } else if (score >= 20) {
    return {
      background: '#FFEBEE',
      number: '#E53935',
      indicator: '#EE5746',
      level: 'Critical'
    };
  } else {
    return {
      background: '#FFCDD2',
      number: '#C62828',
      indicator: '#B71C1C',
      level: 'Emergency'
    };
  }
};

interface MuiDashboardCardProps {
  title: string
  tooltipText?: string
  overallScore: number
  overallChange: number
  overallDirection?: string
  subScores: SubScore[]
  hasAccess?: boolean
  onClick?: () => void
}

export default function MuiDashboardCard({
  title,
  tooltipText,
  overallScore,
  overallChange,
  overallDirection,
  subScores,
  hasAccess = true,
  onClick,
}: MuiDashboardCardProps) {

  // Get colors based on overall score
  const overallColors = getScoreColors(overallScore);

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
      }}
    >

      {/* Overall Score Section - Dynamic Color Based on Score */}
      <Box
        sx={{
          background: overallColors.background,
          p: 1.5,
          borderRadius: '4px',
          border: `1px solid ${overallColors.indicator}`,
        }}
      >
        {/* Previous Week label with info icon */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', fontWeight: 500 }}>
            Previous Week
          </Typography>

        </Box>

        {/* Title + Score row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                color: '#333333',
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              {title === 'Engagement Score' ? 'Engagement Score' : 'Project Score'}
            </Typography>
            {tooltipText && (
              <Tooltip title={tooltipText}>
                <InfoIcon sx={{ fontSize: 16, color: '#333333', mt: '2px' }} />
              </Tooltip>
            )}
          </Box>

          {/* Score and Trend Indicator on Right */}
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Typography
              sx={{
                color: overallColors.number,
                fontSize: "48px",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {Number(overallScore).toFixed(0)}
            </Typography>

            {/* Trend Icon and Change */}
            <Stack direction="row" alignItems="center" gap={0.3}>
              {overallChange === 0 ? (
                <ArrowCircleRightOutlinedIcon
                  sx={{
                    fontSize: "20px",
                    color: "#90A1B9",
                  }}
                />
              ) : overallDirection !== "down" ? (
                <ArrowCircleUpIcon
                  sx={{
                    fontSize: "20px",
                    color: "#2E7D32",
                  }}
                />
              ) : (
                <ArrowCircleDownIcon
                  sx={{
                    fontSize: "20px",
                    color: "#C12626",
                  }}
                />

              )}
              <Typography
                sx={{
                  color: overallChange === 0 ? '#90A1B9' : (overallDirection !== "down" ? "#2E7D32" : "#C12626"),
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {Number(overallChange).toFixed(1)}%
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Sub Scores Section - Dynamic Colors */}
      <Box sx={{ backgroundColor: "#ffffff" }}>
        <Grid container rowSpacing={2} columnSpacing={2} sx={{mt: 0}}>
          {subScores.map((subScore, index) => {
            const subScoreColors = getScoreColors(subScore.score);

            return (
              <Grid item xs={12} sm={6} md={subScores.length === 3 ? 4 : 6} key={index}>
                <Card
                  sx={{
                    p: 1.5,
                    height: "100%",
                    width: "100%",
                    backgroundColor: subScoreColors.background,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "none",
                    border: `1px solid ${subScoreColors.indicator}`,
                    borderRadius: '4px',
                  }}
                >
                  {/* Left side - Label, Score, Change */}
                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    // mb: 0.5,
                  }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "14px",
                          color: "#333333",
                          fontWeight: 600,
                          lineHeight: 1,
                        }}
                      >
                        {subScore.label}
                      </Typography>
                      {subScore.tooltipText && (
                        <Tooltip title={subScore.tooltipText}>
                          <InfoIcon sx={{ fontSize: "16px", color: "#333333", display: "flex" }} />
                        </Tooltip>
                      )}
                    </Box>

                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography
                        sx={{
                          fontSize: "36px",
                          fontWeight: 700,
                          color: subScoreColors.number,
                        }}
                      >
                        {Number(subScore.score).toFixed(0)}
                      </Typography>
                      <Stack direction="row" alignItems="center" gap={0.25}>
                        {subScore.change === 0 ? (
                          <ArrowCircleRightOutlinedIcon
                            sx={{
                              fontSize: "20px",
                              color: "#90A1B9",
                            }}
                          />
                        ) : subScore.positive !== false ? (
                          <ArrowCircleUpIcon
                            sx={{
                              fontSize: "20px",
                              color: "#2E7D32",
                            }}
                          />
                        ) : (
                          <ArrowCircleDownIcon
                            sx={{
                              fontSize: "20px",
                              color: "#C12626",
                            }}
                          />
                        )}
                        <Typography
                          sx={{
                            fontSize: "14px",
                            color: subScore.change === 0 ? "#90A1B9" : (subScore.positive !== false ? "#2E7D32" : "#C12626"),
                            fontWeight: 600,
                          }}
                        >
                          {Number(subScore.change).toFixed(1)}%
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  )
}
