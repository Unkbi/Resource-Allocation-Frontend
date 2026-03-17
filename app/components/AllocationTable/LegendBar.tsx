import { RootState } from '@/app/redux/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Skeleton, IconButton } from '@mui/material';

interface LegendBarProps {
  onClose: () => void;
}

const LegendBar: React.FC<LegendBarProps> = ({ onClose }) => {
  const { allocationTheme, loading } = useSelector(
    (state: RootState) => state.settings
  );

  const toPercent = (value: string | number) =>
    `${Math.round(Number(value) * 100)}%`;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      padding="13px 12px"
    >
      {/* Left side content */}
      <Box display="flex" alignItems="center" gap={4} flexWrap="wrap">
        {/* Allocation */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight={600} fontSize={12}>
            Allocation
          </Typography>

          {loading ? (
            <Skeleton variant="rectangular" width={350} height={24} />
          ) : (
            <Box display="flex" borderRadius={2} overflow="hidden">
              {allocationTheme?.slice(0, 7).map((item: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: item.Color,
                    padding: '4px 12px',
                    minWidth: 80,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" fontWeight={600} fontSize={10}>
                    {item.Label || 'ColorLabel'} : {toPercent(item.From)} -{' '}
                    {toPercent(item.To)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Actuals */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body2"
            fontWeight={600}
            fontSize={12}
            sx={{ marginRight: '12px' }}
          >
            Actuals
          </Typography>

          {loading ? (
            <Skeleton variant="rectangular" width={200} height={24} />
          ) : (
            <Box
              sx={{
                display: 'flex',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
              }}
            >
              <Box sx={{ background: '#F0FFEC', px: 2, py: '3px' }}>
                <Typography
                  sx={{ color: '#22BE48', fontSize: 10, fontWeight: 600 }}
                >
                  On-Target
                </Typography>
              </Box>

              <Box sx={{ background: '#fff8d6', px: 2, py: '3px' }}>
                <Typography
                  sx={{ color: '#caa200', fontSize: 10, fontWeight: 600 }}
                >
                  {' '}
                  Under-Achieved{' '}
                </Typography>
              </Box>

              <Box sx={{ background: '#FFF5F5', px: 2, py: '3px' }}>
                <Typography
                  sx={{ color: '#B91C1C', fontSize: 10, fontWeight: 600 }}
                >
                  Over-Achieved
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Close Button */}
      <IconButton
        size="small"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 130 }}
      >
        <img src="/images/icons/CloseRemoveBtn.svg" alt="Close" />
      </IconButton>
    </Box>
  );
};

export default LegendBar;
