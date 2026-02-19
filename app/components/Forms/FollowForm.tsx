'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  Checkbox,
  FormControlLabel,
  Divider,
  styled,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { StatusPill } from '../Settings/styled';

interface FollowFormProps {
  formikProps: any;
  setFormValue: (value: any) => void;
  objectType?: 'project' | 'team'; // 'project' or 'team'
}

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#313F68',
        ...theme.applyStyles('dark', {
          backgroundColor: '#313F68',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

const FollowForm: React.FC<FollowFormProps> = ({
  formikProps,
  setFormValue,
  objectType = 'project', // Default to 'project' for backward compatibility
}) => {
  const { values, setFieldValue } = formikProps;
  const { initialData } = useSelector((state: any) => state.globalDialog.formState);
  const { projectTypes } = useSelector((state: any) => state.allSettings);

  useEffect(() => {
    if (initialData) {
      setFormValue({
        isFollowing: initialData.isFollowing ?? true,
        weeklyAISummary: initialData.weeklyAISummary ?? true,
        dailySummary: initialData.dailySummary ?? true,
        planChanges: initialData.planChanges ?? (objectType === 'team' ? false : true), // False for teams, true for projects
        actualsUpdates: initialData.actualsUpdates ?? true,
        existingFollowId: initialData.existingFollowId || null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, objectType]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy');
    } catch {
      return '';
    }
  };

  const getProjectTypeName = (typeId: string) => {
    const projectType = projectTypes?.find((pt: any) => pt.Id === typeId);
    return projectType?.Name || '';
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Approved': '#4169E1',
      'Active': '#00C9A7',
      'Requested': '#FFD700',
      'Paused': '#FF884D',
      'Cancelled': '#FF6B6B',
      'Completed': '#9C27B0',
    };
    return statusColors[status] || '#4169E1';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Following/Unfollow Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AntSwitch
          checked={values.isFollowing ?? true}
          onChange={(e) => setFieldValue('isFollowing', e.target.checked)}
        />
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#313F68',
          }}
        >
          {values.isFollowing ? 'Following' : 'Unfollow'}
        </Typography>
      </Box>

      {/* Notification Preferences Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <NotificationsActiveOutlinedIcon sx={{ color: '#313F68', fontSize: 20 }} />
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 500,
              color: '#313F68',
            }}
          >
            Notification Preferences
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '12px',
            color: '#333333',
            mb: 2,
            ml: 3.5,
          }}
        >
          Manage notification preferences for Connected Experience
        </Typography>

        {/* Weekly AI Summary */}
        <Box sx={{ mb: 2, ml: 0.5, border: '1px solid #E5E7EB', borderRadius: '10px', p: 1.5, opacity: values.isFollowing ? 1 : 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AntSwitch
              checked={values.weeklyAISummary ?? true}
              onChange={(e) => setFieldValue('weeklyAISummary', e.target.checked)}
              size="small"
              disabled={!values.isFollowing}
            />
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#313F68',
              }}
            >
              Weekly AI Summary
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '12px',
              color: '#333333',
              ml: 6,
            }}
          >
            Receive an AI-generated weekly summary every Monday at 1 AM
          </Typography>
        </Box>

        {/* Daily Summary */}
        <Box sx={{ mb: 2, ml: 0.5, border: '1px solid #E5E7EB', borderRadius: '10px', p: 1.5, opacity: values.isFollowing ? 1 : 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AntSwitch
              checked={values.dailySummary ?? true}
              onChange={(e) => setFieldValue('dailySummary', e.target.checked)}
              size="small"
              disabled={!values.isFollowing}
            />
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#313F68',
              }}
            >
              Daily Summary
            </Typography>
          </Box>

          {/* Nested Checkboxes */}
          <Box sx={{ ml: 6, mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={values.planChanges ?? true}
                  onChange={(e) => setFieldValue('planChanges', e.target.checked)}
                  disabled={!values.isFollowing}
                  sx={{
                    color: '#313F68',
                    '&.Mui-checked': {
                      color: '#313F68',
                    },
                    padding: '4px',
                  }}
                />
              }
              label={
                <Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#313F68',
                    }}
                  >
                    Plan Changes
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#333333',
                    }}
                  >
                    Daily summary of plan updates at 6 PM
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', mb: 1 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={values.actualsUpdates ?? true}
                  size='small'
                  onChange={(e) => setFieldValue('actualsUpdates', e.target.checked)}
                  disabled={!values.isFollowing}
                  sx={{
                    color: '#313F68',
                    '&.Mui-checked': {
                      color: '#313F68',
                    },
                    padding: '4px',
                  }}
                />
              }
              label={
                <Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#313F68',
                    }}
                  >
                    Actuals Updates
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#333333',
                    }}
                  >
                    Daily summary of actuals updates at 6 PM
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 0.5 }} />

      {/* Details Section */}
      <Box>
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#313F68',
            mb: 2,
          }}
        >
          {objectType === 'team' ? 'Team Details' : 'Project Details'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Name */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#4A5565',
              }}
            >
              {objectType === 'team' ? 'Team Name:' : 'Project Name:'}
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#212121',
              }}
            >
              {(objectType === 'team' ? initialData?.Team : initialData?.Name) || ''}
            </Typography>
          </Box>

          {/* Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              sx={{
                fontSize: '14px',
                color: '#4A5565',
              }}
            >
              Status:
            </Typography>
            <StatusPill status={initialData?.Status || ''} > {initialData?.Status || ''} </StatusPill>
          </Box>

          {/* Location */}
           {objectType === 'project' && (
            <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#4A5565',
              }}
            >
              Location:
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#212121',
              }}
            >
              {initialData?.Location || 'N/A'}
            </Typography>
          </Box>
         
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#4A5565',
                }}
              >
                Type:
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#212121',
                }}
              >
                {getProjectTypeName(initialData?.Type) || 'N/A'}
              </Typography>
            </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#4A5565',
              }}
            >
              Duration:
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#212121',
              }}
            >
              {initialData?.StartDate && initialData?.EndDate
                ? `${formatDate(initialData.StartDate)} - ${formatDate(initialData.EndDate)}`
                : initialData?.StartDate
                  ? formatDate(initialData.StartDate)
                  : 'N/A'}
            </Typography>
          </Box>
            </>
           )}
        </Box>
      </Box>
    </Box>
  );
};

export default FollowForm;

