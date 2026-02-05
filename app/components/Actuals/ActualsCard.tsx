import { HOURS } from '@/app/constants/constants';
import { RootState } from '@/app/redux/store';
import { ActualAllocations } from '@/app/types';
import {
  format2,
  isPeriodCurrentWeek,
  isPeriodFutureWeek,
  isPeriodPastWeek,
  isPeriodWithinRange,
  roundToStep05,
} from '@/app/utils/actualsUtils';
import { Box, Skeleton, styled, Typography } from '@mui/material';
// @ts-ignore
import { getWeek, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

interface ActualsCardProps {
  onClick?: () => void;
  period: string;
  actualAllocationData: ActualAllocations[] | null;
  actualAllocationStatus: string | null;
  showStatus?: boolean;
  loading?: boolean;
  actualAllocationsStatusesLoading?: boolean;
  backgroundColor?: string;
  periodPillBackgroundColor?: string;
  textColor?: string;
  contrastTextColor?: string;
  borderStyle?: Record<string, string>;
  resourceStartMonday: Date | null;
  resourceEndMonday: Date | null;
}

const ActualsCardBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '110px',
  borderRadius: '8px 8px 0px 0px',
  alignItems: 'center',
}));

const ActualsPeriodPill = styled(Box)(({ theme }) => ({
  position: 'relative',
  top: '5px',
  left: 'calc(100% - 150px)',
  height: '20px',
  padding: '0px 12px',
  borderRadius: '55px',
  backgroundColor: 'rgba(255, 255, 255, 1)',
  display: 'flex',
  alignItems: 'center',
}));

const WeekNumnerHeaderTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 20,
  color: 'rgba(0, 0, 0, 1)',
  marginTop: theme.spacing(1),
}));

const AllocationInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'center',
  marginTop: theme.spacing(1),
  gap: 6,
}));

const AllocationsDataBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const WeekCardBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '110px',
  borderRadius: '8px 8px 0px 0px',
  alignItems: 'center',
  border: '1px solid rgba(202, 213, 226, 1)',
  borderBottom: 'none',
  backgroundColor: 'rgba(202, 213, 226, 0.2)',
  cursor: 'pointer',
}));

const ActualsCard = ({
  onClick = () => {},
  period,
  actualAllocationData,
  actualAllocationStatus,
  showStatus = true,
  loading,
  actualAllocationsStatusesLoading,
  backgroundColor = 'rgba(30, 58, 139, 1)',
  periodPillBackgroundColor = 'rgba(255, 255, 255, 1)',
  borderStyle = {},
  resourceStartMonday,
  resourceEndMonday,
}: ActualsCardProps) => {
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const totalPlannedAllocation = useMemo(() => {
    const sum =
      actualAllocationData?.reduce(
        (total, alloc) => total + (alloc?.AllocationEntered || 0),
        0
      ) || 0;

    return scalarSettings?.Actuals_Allocation_Preference === HOURS
      ? sum
      : format2(roundToStep05(sum));
  }, [actualAllocationData, scalarSettings]);

  const totalActualAllocation = useMemo(() => {
    const sum =
      actualAllocationData?.reduce(
        (total, alloc) => total + (alloc?.ActualsEntered || 0),
        0
      ) || 0;

    return scalarSettings?.Actuals_Allocation_Preference === HOURS
      ? sum
      : format2(roundToStep05(sum));
  }, [actualAllocationData, scalarSettings]);

  const isPastWeek = useMemo(() => {
    if (!period) {
      return false;
    }
    return isPeriodPastWeek(period);
  }, [period]);

  const isCurrentWeek = useMemo(() => {
    if (!period) {
      return false;
    }
    return isPeriodCurrentWeek(period);
  }, [period]);

  const isFutureWeek = useMemo(() => {
    if (!period) {
      return true;
    }
    return isPeriodFutureWeek(period);
  }, [period]);

  const isWithinResourceRange = useMemo(() => {
    if (!resourceStartMonday || !resourceEndMonday || !period) {
      return true;
    }
    const periodMonday = parseISO(period);
    return isPeriodWithinRange(
      periodMonday,
      resourceStartMonday,
      resourceEndMonday
    );
  }, [resourceStartMonday, resourceEndMonday, period]);

  const getStatusIcon = () => {
    if (loading) {
      return <Skeleton width={16} height={16} sx={{ marginTop: 1 }} />;
    }
    if (!isWithinResourceRange) {
      return <></>;
    }
    switch (actualAllocationStatus) {
      case 'Confirmed':
        return (
          <img
            src="/images/icons/confirmed.svg"
            alt="Confirmed"
            width={16}
            height={16}
            style={{ marginTop: 8 }}
          />
        );
      case 'In-Progress':
        return (
          <img
            src="/images/icons/inprogress.svg"
            alt="In Progress"
            width={16}
            height={16}
            style={{ marginTop: 8 }}
          />
        );
      case 'Not Started':
        return (
          <img
            src="/images/icons/notstarted-new.svg"
            alt="Not Started"
            width={24}
            height={24}
            style={{ marginTop: 8 }}
          />
        );
      default:
        return (
          <img
            src="/images/icons/notstarted-new.svg"
            alt="Not Started"
            width={24}
            height={24}
            style={{ marginTop: 8 }}
          />
        );
    }
  };
  const getPeriodPillText = () => {
    if (loading) {
      return <Skeleton width={40} height={20} />;
    }

    return (
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 10,
          color: isCurrentWeek ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)',
        }}
      >
        {isCurrentWeek ? 'Current' : isFutureWeek ? 'Future' : 'Past'}
      </Typography>
    );
  };

  return (
    <WeekCardBox
      onClick={() => isWithinResourceRange && onClick()}
      sx={{
        opacity: loading || isWithinResourceRange ? 1 : 0.5,
        backgroundColor: isCurrentWeek
          ? 'rgba(30, 58, 139, 1)'
          : isFutureWeek
            ? 'rgba(251, 251, 251, 1)'
            : 'rgba(202, 213, 226, 0.2)',
        ...borderStyle,
        ...(!isWithinResourceRange && { cursor: 'not-allowed' }),
      }}
    >
      {loading || (showStatus && actualAllocationStatus) || isPastWeek ? (
        <ActualsPeriodPill
          sx={{
            backgroundColor: 'transparent',
            top: '2px',
            left: 'calc(100% - 132px)',
          }}
        >
          {getStatusIcon()}
        </ActualsPeriodPill>
      ) : (
        <ActualsPeriodPill
          sx={{
            ...(!isCurrentWeek
              ? { backgroundColor: 'rgba(30, 58, 139, 1)' }
              : {}),
          }}
        >
          {getPeriodPillText()}
        </ActualsPeriodPill>
      )}
      <ActualsCardBox sx={{ marginTop: -2, border: 'none' }}>
        <WeekNumnerHeaderTypography
          sx={{
            color: isCurrentWeek
              ? 'rgba(255, 255, 255, 1)'
              : 'rgba(0, 0, 0, 1)',
          }}
        >
          {loading ? (
            <Skeleton width={80} />
          ) : (
            `Week ${
              !isNaN(
                getWeek(parseISO(period || ''), {
                  weekStartsOn: 1,
                })
              )
                ? getWeek(parseISO(period || ''), {
                    weekStartsOn: 1,
                  })
                : '--'
            }`
          )}
        </WeekNumnerHeaderTypography>
        <AllocationInfoBox>
          <Typography
            sx={{
              color: isCurrentWeek
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(0, 0, 0, 1)',
              fontSize: 16,
              paddingTop: 0.5,
            }}
          >
            Allocation:{' '}
          </Typography>
          <AllocationsDataBox>
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Skeleton width={15} height={30} />
                <span style={{ color: 'rgba(150, 154, 162, 1)' }}>/</span>
                <Skeleton width={15} height={30} />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    marginTop: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: isCurrentWeek
                      ? 'rgba(255, 255, 255, 1)'
                      : 'rgba(0, 0, 0, 1)',
                  }}
                >
                  <span style={{ color: 'rgba(150, 154, 162, 1)' }}>
                    {isWithinResourceRange
                      ? `${totalPlannedAllocation ? totalPlannedAllocation : '--'} /`
                      : 'N/A /'}
                  </span>{' '}
                  {isWithinResourceRange
                    ? `${totalActualAllocation ? totalActualAllocation : '--'}`
                    : 'N/A'}
                </Typography>
                {scalarSettings?.Actuals_Allocation_Preference === HOURS && (
                  <Typography
                    sx={{
                      position: 'relative',
                      top: '2px',
                      marginLeft: '4px',
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: isCurrentWeek
                        ? 'rgba(255, 255, 255, 1)'
                        : 'rgba(0, 0, 0, 1)',
                    }}
                  >
                    (hrs)
                  </Typography>
                )}
              </Box>
            )}
            <Typography
              sx={{
                fontSize: 10,
                color: isCurrentWeek
                  ? 'rgba(255, 255, 255, 1)'
                  : 'rgba(0, 0, 0, 1)',
              }}
            >
              Planned / Actual
            </Typography>
          </AllocationsDataBox>
        </AllocationInfoBox>
      </ActualsCardBox>
    </WeekCardBox>
  );
};

export default ActualsCard;
