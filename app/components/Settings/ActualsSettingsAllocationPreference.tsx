import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import { useEffect, useState } from 'react';
import {
  ACTUALS_ALLOCATION_PREFERENCE_OPTIONS,
  DEFAULT_ACTUALS_ALLOCATION_PREFERENCE,
} from '@/app/constants/constants';
import { useDispatch } from 'react-redux';
import {
  FETCH_USER_PREFERENCES,
  SET_USER_PREFERENCES,
} from '@/app/redux/actions/userPreferencesActions';
import { LoginUser } from '@/app/types';
import { AxiosError } from 'axios';
import { showToastAction } from '@/app/redux/actions/toastAction';

function ActualsSettingsAllocationPreference() {
  const { userPreferences } = useSelector(
    (state: RootState) => state.userPreferences
  );
  const { user } = useSelector((state: RootState) => state.user);

  const [
    currentActualsAllocationPreference,
    setCurrentActualsAllocationPreference,
  ] = useState<string>(DEFAULT_ACTUALS_ALLOCATION_PREFERENCE);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (user && !userPreferences) {
      dispatch({
        type: FETCH_USER_PREFERENCES,
        payload: { userId: (user as LoginUser)?.id },
      });
    }
  }, []);

  useEffect(() => {
    setCurrentActualsAllocationPreference(
      (userPreferences?.Actuals_Allocation_Preference ||
        DEFAULT_ACTUALS_ALLOCATION_PREFERENCE) as string
    );
  }, [userPreferences]);

  const handleUpdateActualsAllocationPreference = () => {
    if (!user) return;
    if (currentActualsAllocationPreference) {
      // Add to User Preferences.
      new Promise((resolve, reject) => {
        dispatch({
          type: SET_USER_PREFERENCES,
          payload: {
            postData: {
              User: (user as LoginUser)?.id,
              Key: 'Actuals_Allocation_Preference',
              Value: currentActualsAllocationPreference,
            },
            resolve,
            reject,
          },
        });
      })
        .then(() => {
          dispatch(
            showToastAction(
              true,
              'Updating User Preference successfully.',
              'success'
            )
          );
        })
        .catch((err: AxiosError) => {
          console.log('Error Updating User Preference : ', err);
          dispatch(
            showToastAction(
              true,
              `Failed to set User Preferences. ${err?.response?.data}`,
              'error'
            )
          );
        });
    }
  };

  return (
    <Box
      sx={{ mt: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}
    >
      <Box
        width="50%"
        px={4}
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
          px: 4,
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
              (userPreferences?.Actuals_Allocation_Preference ||
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
            userPreferences?.Actuals_Allocation_Preference
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
