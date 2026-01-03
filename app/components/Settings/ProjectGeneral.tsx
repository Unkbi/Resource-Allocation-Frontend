import { Box, Button, Typography } from '@mui/material';
import { StyledInput } from '../Input';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { useEffect, useState } from 'react';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';
import { useDispatch } from 'react-redux';
import {
  ADD_SCALAR_SETTING,
  UPDATE_SCALAR_SETTING,
} from '@/app/redux/actions/allSettingsActions';

interface ProjectGeneralProps {
  permissions?: Record<string, CrudPermissions>;
  loadingPermissions?: boolean;
}

function ProjectGeneral({
  permissions,
  loadingPermissions,
}: ProjectGeneralProps) {
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );

  const [currentPortfolioNameSettings, setCurrentPortfolioNameSettings] =
    useState<string>(PORTFOLIO_DISPLAY_NAME);
  const dispatch = useDispatch();

  useEffect(() => {
    if (loadingPermissions) return;
    setCurrentPortfolioNameSettings(
      (scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME) as string
    );
  }, [loadingPermissions]);

  const handleUpdateProfolioName = () => {
    if (currentPortfolioNameSettings) {
      if (scalarSettings?.Portfolio_Name) {
        if (scalarSettings?.Portfolio_Name !== currentPortfolioNameSettings) {
          // Update Portfolio_Name
          dispatch({
            type: UPDATE_SCALAR_SETTING,
            payload: {
              postData: {
                SettingKey: 'Portfolio_Name',
                SettingValue: currentPortfolioNameSettings,
              },
            },
          });
        }
      } else {
        // Add to Scalar Settings.
        dispatch({
          type: ADD_SCALAR_SETTING,
          payload: {
            postData: {
              SettingKey: 'Portfolio_Name',
              SettingValue: currentPortfolioNameSettings,
            },
          },
        });
      }
    }
  };

  return (
    <Box
      sx={{ mt: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}
    >
      {permissions && permissions['Portfolio']?.r ? (
        <Box
          px={2}
          py={2}
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ borderBottom: '0.667px solid #E5E7EB' }}
        >
          <Typography
            sx={{
              fontWeight: '600',
              fontStyle: 'SemiBold',
              fontSize: '14px',
              leadingTrim: 'NONE',
              lineHeight: '16px',
              letterSpacing: '0.6px',
              verticalAlign: 'middle',
              textTransform: 'capitalize',
              minWidth: '160px',
            }}
          >
            Project Grouping Name
          </Typography>
          <StyledInput
            sx={{ width: '200px' }}
            value={currentPortfolioNameSettings}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentPortfolioNameSettings(e.target.value)
            }
          />
          <Button
            disabled={
              currentPortfolioNameSettings === scalarSettings?.Portfolio_Name
            }
            variant="contained"
            onClick={handleUpdateProfolioName}
            sx={{
              height: 40,
              borderRadius: 2,
              background: '#152E75',
              color: '#FFF',
              textTransform: 'none',
              fontSize: 14,
              fontWeight: 600,
              px: 2,
            }}
          >
            {'Update'}
          </Button>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <img src="/images/icons/InfoRounded.svg" alt="info" />
          </Box>
          <Typography
            sx={{
              fontWeight: '400',
              fontSize: '12px',
              letterSpacing: '0px',
              verticalAlign: 'middle',
            }}
          >
            Rename the term portfolio used accross the system
          </Typography>
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
}

export default withRBAC(ProjectGeneral, ['Portfolio']);
