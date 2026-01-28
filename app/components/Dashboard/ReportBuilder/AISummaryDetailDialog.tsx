'use client';

import { Dialog, Box, Typography, IconButton, Button, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';

interface AISummaryDetailDialogProps {
  open: boolean;
  onClose: () => void;
  data: {
    projectName?: string;
    projectManager?: string;
    weekNumber?: number;
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
    maxWidth: '65%',
    width: '65%',
    borderRadius: 0,
    position: 'fixed',
    right: 0,
    top: 0,
  },
}));

const getScoreColor = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return '#9CA3AF';
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};

export default function AISummaryDetailDialog({ open, onClose, data }: AISummaryDetailDialogProps) {
  const {
    projectName,
    projectManager,
    weekNumber,
    weekDate,
    score,
    alignmentScore,
    healthScore,
    scoreBand,
    summaryHtml,
  } = data;

  const handleDownload = () => {
    // Create HTML content for download
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${projectName} - AI Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #1F2937; }
            .scores { display: flex; gap: 20px; margin: 20px 0; }
            .score-card { padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #E5E7EB; }
            th { background-color: #F9FAFB; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>${projectName}</h1>
          <p><strong>Project Manager:</strong> ${projectManager || 'N/A'}</p>
          <p><strong>Week:</strong> ${weekNumber} - ${weekDate}</p>
          <div class="scores">
            <div class="score-card">
              <p>Project Score: <strong>${score}</strong></p>
            </div>
            <div class="score-card">
              <p>Alignment Score: <strong>${alignmentScore ?? 'N/A'}</strong></p>
            </div>
            <div class="score-card">
              <p>Health Score: <strong>${healthScore ?? 'N/A'}</strong></p>
            </div>
          </div>
          <h2>Summary</h2>
          ${summaryHtml || '<p>No summary available</p>'}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_Week${weekNumber}_Summary.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!summaryHtml) {
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
            AI Chatbot Development Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <IconButton onClick={onClose} size="small" sx={{ color: '#FFFFFF' }}>
              <CloseIcon sx={{ fontSize: '14px' }} />
            </IconButton>
          </Box>
        </Box>


          {/* No Data Message */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
              No summary available for this period
            </Typography>
          </Box>
        </Box>
      </StyledDialog>
    );
  }

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
            AI Chatbot Development Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <IconButton onClick={onClose} size="small" sx={{ color: '#FFFFFF' }}>
              <CloseIcon sx={{ fontSize: '14px' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {/* Project Info Card */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button
              variant="text"
              size="small"
              endIcon={<DownloadIcon sx={{ fontSize: '14px', color:'#5D6979' }} />}
              onClick={handleDownload}
              sx={{
                textTransform: 'none',
                color: '#1C2D5F',
                fontSize: '14px',
                fontWeight: 400,
                px: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Download AI Summary
            </Button>
          </Box>
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '8px',
              p: 3,
              mb: 3,
              border: '1px solid #E5E7EB',
            }}
          >
           
              {/* Render HTML content with styling */}
              <Box
                sx={{
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: '#374151',
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1F2937',
                    marginTop: '16px',
                    marginBottom: '8px',
                  },
                  '& p': {
                    marginBottom: '12px',
                  },
                  '& ul, & ol': {
                    paddingLeft: '20px',
                    marginBottom: '12px',
                  },
                  '& li': {
                    marginBottom: '6px',
                  },
                  '& strong': {
                    fontWeight: 600,
                    color: '#1F2937',
                  },
                  '& em': {
                    fontStyle: 'italic',
                  },
                  '& code': {
                    backgroundColor: '#F3F4F6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  },
                  '& pre': {
                    backgroundColor: '#F3F4F6',
                    padding: '12px',
                    borderRadius: '6px',
                    overflow: 'auto',
                    marginBottom: '12px',
                  },
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '16px',
                    fontSize: '12px',
                    bgcolor: '#FFFFFF',
                  },
                  '& th': {
                    backgroundColor: '#F9FAFB',
                    padding: '10px',
                    textAlign: 'left',
                    fontWeight: 600,
                    borderBottom: '2px solid #E5E7EB',
                    color: '#374151',
                  },
                  '& td': {
                    padding: '10px',
                    borderBottom: '1px solid #E5E7EB',
                  },
                  '& a': {
                    color: '#2563EB',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                  '& blockquote': {
                    borderLeft: '4px solid #E5E7EB',
                    paddingLeft: '16px',
                    margin: '12px 0',
                    color: '#6B7280',
                    fontStyle: 'italic',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: summaryHtml }}
              />
            </Box>
          </Box>
      </Box>
    </StyledDialog>
  );
}
