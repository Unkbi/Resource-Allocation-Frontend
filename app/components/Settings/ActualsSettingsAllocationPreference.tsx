import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import { useEffect, useState } from 'react';
import {
  ACTUALS_ALLOCATION_PREFERENCE_OPTIONS,
  DEFAULT_ACTUALS_ALLOCATION_PREFERENCE,
} from '@/app/constants/constants';
import { useDispatch } from 'react-redux';
import {
  ADD_SCALAR_SETTING,
  UPDATE_SCALAR_SETTING,
} from '@/app/redux/actions/allSettingsActions';

function ActualsSettingsAllocationPreference() {
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );

  const [
    currentActualsAllocationPreference,
    setCurrentActualsAllocationPreference,
  ] = useState<string>(DEFAULT_ACTUALS_ALLOCATION_PREFERENCE);
  const dispatch = useDispatch();

  useEffect(() => {
    setCurrentActualsAllocationPreference(
      (scalarSettings?.Actuals_Allocation_Preference ||
        DEFAULT_ACTUALS_ALLOCATION_PREFERENCE) as string
    );
  }, [scalarSettings]);

  const handleUpdateActualsAllocationPreference = () => {
    if (currentActualsAllocationPreference) {
      if (scalarSettings?.Actuals_Allocation_Preference) {
        if (
          scalarSettings?.Actuals_Allocation_Preference !==
          currentActualsAllocationPreference
        ) {
          // Update Actuals_Allocation_Preference
          dispatch({
            type: UPDATE_SCALAR_SETTING,
            payload: {
              postData: {
                SettingKey: 'Actuals_Allocation_Preference',
                SettingValue: currentActualsAllocationPreference,
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
              SettingKey: 'Actuals_Allocation_Preference',
              SettingValue: currentActualsAllocationPreference,
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
      <Box
        width="50%"
        px={2}
        py={2}
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
          Select Preference
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <Select
            value={currentActualsAllocationPreference}
            onChange={e =>
              setCurrentActualsAllocationPreference(e.target.value as string)
            }
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            sx={{
              height: 40,
              fontSize: 14,
              fontWeight: 400,
              color: '#111827',
              mr: 2,
              mt: 1,
              mb: 1,
              minWidth: '200px',
              maxWidth: '300px',
            }}
          >
            {ACTUALS_ALLOCATION_PREFERENCE_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '50%',
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            setCurrentActualsAllocationPreference(
              (scalarSettings?.Actuals_Allocation_Preference ||
                DEFAULT_ACTUALS_ALLOCATION_PREFERENCE) as string
            );
          }}
          sx={{
            height: 40,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: 14,
            fontWeight: 600,
            px: 2,
          }}
        >
          {'Cancel'}
        </Button>
        <Button
          disabled={
            currentActualsAllocationPreference ===
            scalarSettings?.Actuals_Allocation_Preference
          }
          variant="contained"
          onClick={handleUpdateActualsAllocationPreference}
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
          {'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}

export default ActualsSettingsAllocationPreference;
