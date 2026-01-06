import { ActualAllocations } from '@/app/types';
import { getMondayOfISO } from '@/app/utils/common';
import { Box, Skeleton, styled, Typography } from '@mui/material';
// @ts-ignore
import { getWeek, parseISO } from 'date-fns';
import { useMemo } from 'react';

interface ActualsCardProps {
  actualAllocationData: ActualAllocations[] | null;
  actualAllocationStatus: string | null;
  loading?: boolean;
  actualAllocationsStatusesLoading?: boolean;
  backgroundColor?: string;
  periodPillBackgroundColor?: string;
  textColor?: string;
  contrastTextColor?: string;
  borderStyle?: Record<string, string>;
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
  backgroundColor: 'rgba(202, 213, 226, 0.2)',
}));

const ActualsCard = ({
  actualAllocationData,
  actualAllocationStatus,
  loading,
  actualAllocationsStatusesLoading,
  backgroundColor = 'rgba(30, 58, 139, 1)',
  periodPillBackgroundColor = 'rgba(255, 255, 255, 1)',
  borderStyle = {},
}: ActualsCardProps) => {
  const totalPlannedAllocation = useMemo(
    () =>
      actualAllocationData?.reduce(
        (total, alloc) => total + (alloc?.AllocationEntered || 0),
        0
      ),
    [actualAllocationData]
  );

  const totalActualAllocation = useMemo(
    () =>
      actualAllocationData?.reduce(
        (total, alloc) => total + (alloc?.ActualsEntered || 0),
        0
      ),
    [actualAllocationData]
  );

  const isPastWeek = useMemo(() => {
    if (loading || actualAllocationsStatusesLoading) {
      return false;
    }
    if (!actualAllocationData?.[0]?.Period) {
      return false;
    }
    return (
      getMondayOfISO(new Date().toISOString()) >
      getMondayOfISO(actualAllocationData?.[0]?.Period)
    );
  }, [actualAllocationData, loading, actualAllocationsStatusesLoading]);

  const isCurrentWeek = useMemo(() => {
    if (loading || actualAllocationsStatusesLoading) {
      return false;
    }
    if (!actualAllocationData?.[0]?.Period) {
      return false;
    }
    return (
      getMondayOfISO(new Date().toISOString()) ===
      getMondayOfISO(actualAllocationData?.[0]?.Period)
    );
  }, [actualAllocationData, loading, actualAllocationsStatusesLoading]);

  const isFutureWeek = useMemo(() => {
    if (loading || actualAllocationsStatusesLoading) {
      return false;
    }
    if (!actualAllocationData?.[0]?.Period) {
      return true;
    }
    return (
      getMondayOfISO(new Date().toISOString()) <
      getMondayOfISO(actualAllocationData?.[0]?.Period)
    );
  }, [actualAllocationData, loading, actualAllocationsStatusesLoading]);

  const getPeriodPillText = () => {
    if (loading || actualAllocationsStatusesLoading) {
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
      sx={{
        backgroundColor: loading
          ? backgroundColor
          : isCurrentWeek
            ? 'rgba(30, 58, 139, 1)'
            : isFutureWeek
              ? 'rgba(251, 251, 251, 1)'
              : 'rgba(202, 213, 226, 0.2)',
        ...borderStyle,
      }}
    >
      <ActualsPeriodPill
        sx={{
          ...(loading
            ? { backgroundColor: periodPillBackgroundColor }
            : !isCurrentWeek
              ? { backgroundColor: 'rgba(30, 58, 139, 1)' }
              : {}),
        }}
      >
        {getPeriodPillText()}
      </ActualsPeriodPill>
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
                getWeek(parseISO(actualAllocationData?.[0]?.Period || ''), {
                  weekStartsOn: 1,
                })
              )
                ? getWeek(parseISO(actualAllocationData?.[0]?.Period || ''), {
                    weekStartsOn: 1,
                  })
                : '--'
            }`
          )}
        </WeekNumnerHeaderTypography>
        <AllocationInfoBox>
          <Typography sx={{ fontSize: 16, paddingTop: 0.5 }}>
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
                  {`${totalPlannedAllocation ? totalPlannedAllocation.toFixed(1) : '--'} /`}
                </span>{' '}
                {`${totalActualAllocation ? totalActualAllocation.toFixed(1) : '--'}`}
              </Typography>
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
