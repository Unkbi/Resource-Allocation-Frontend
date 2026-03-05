'use client';

import { Dialog, Box, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

interface AISummaryDetailDialogProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  data: {
    projectName?: string;
    projectManager?: string;
    weekNumber?: number;
    weekLabel?: string;  // e.g., "W4"
    weekDate?: string;
    score?: number;
    alignmentScore?: number;
    healthScore?: number;
    scoreBand?: string;
    summaryHtml?: string;
  };
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    justifyContent: 'flex-end',
  },
  '& .MuiPaper-root': {
    margin: 0,
    maxHeight: '100%',
    height: '100vh',
    maxWidth: '60%',
    minWidth: '53%',
    borderRadius: 0,
    position: 'fixed',
    right: 0,
    top: 0,
  },
}));

export default function AISummaryDetailDialog({ open, onClose, loading = false, data }: AISummaryDetailDialogProps) {
  const {
    projectName,
    projectManager,
    weekNumber,
    weekLabel,
    weekDate,
    score,
    alignmentScore,
    healthScore,
    scoreBand,
    summaryHtml,
  } = data;
  const [isDownloading, setIsDownloading] = useState(false);
  const displayWeek = weekLabel || (weekNumber != null ? `W${weekNumber}` : 'N');

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Create complete HTML document with styling
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${projectName || 'Project'} - AI Summary</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 13px;
                line-height: 1.7;
                color: #374151;
                padding: 20px;
                background: #FFFFFF;
              }
              h1, h2, h3, h4, h5, h6 {
                font-size: 14px;
                font-weight: 600;
                color: #1F2937;
                margin-top: 16px;
                margin-bottom: 8px;
              }
              p {
                margin-bottom: 12px;
              }
              ul, ol {
                padding-left: 20px;
                margin-bottom: 12px;
              }
              li {
                margin-bottom: 6px;
              }
              strong {
                font-weight: 600;
                color: #1F2937;
              }
              em {
                font-style: italic;
              }
              code {
                background-color: #F3F4F6;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                font-family: monospace;
              }
              pre {
                background-color: #F3F4F6;
                padding: 12px;
                border-radius: 6px;
                overflow: auto;
                margin-bottom: 12px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 16px;
                font-size: 12px;
              }
              th {
                background-color: #F9FAFB;
                padding: 10px;
                text-align: left;
                font-weight: 600;
                border-bottom: 2px solid #E5E7EB;
                color: #374151;
              }
              td {
                padding: 10px;
                border-bottom: 1px solid #E5E7EB;
              }
              a {
                color: #2563EB;
                text-decoration: none;
              }
              blockquote {
                border-left: 4px solid #E5E7EB;
                padding-left: 16px;
                margin: 12px 0;
                color: #6B7280;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            ${summaryHtml || '<p>No summary available</p>'}
          </body>
        </html>
      `;

      // Call the API to generate PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: fullHtml,
          filename: `${projectName || 'Project'}_${displayWeek}_Summary.pdf`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'Project'}_${displayWeek}_Summary.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} TransitionProps={{ timeout: 400 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#F9FAFB' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            bgcolor: '#1C2D5F',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
            {projectName ? `${projectName} Summary` : 'AI Summary'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <IconButton onClick={onClose} size="small" sx={{ color: '#FFFFFF' }}>
              <CloseIcon sx={{ fontSize: '14px' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            /* Loading state while fetching SummaryHtml from API */
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <CircularProgress size={32} sx={{ color: '#1C2D5F' }} />
            </Box>
          ) : !summaryHtml ? (
            /* No summary available */
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                No summary available for this period
              </Typography>
            </Box>
          ) : (
            /* Summary content */
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="text"
                  size="small"
                  endIcon={<DownloadIcon sx={{ fontSize: '14px', color: '#5D6979' }} />}
                  onClick={handleDownload}
                  disabled={isDownloading}
                  sx={{
                    textTransform: 'none',
                    color: '#1C2D5F',
                    fontSize: '14px',
                    fontWeight: 400,
                    px: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:disabled': {
                      color: '#9CA3AF',
                    },
                  }}
                >
                  {isDownloading ? 'Generating PDF...' : 'Download AI Summary'}
                </Button>
              </Box>
              <Box sx={{ py: 0.5 }}>
                <Box dangerouslySetInnerHTML={{ __html: summaryHtml }} />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </StyledDialog>
  );
}

