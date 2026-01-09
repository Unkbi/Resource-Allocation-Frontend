import { ActualAllocationTableRow } from '@/app/types';
import { Box, IconButton, Tooltip } from '@mui/material';
import { GridValidRowModel } from '@mui/x-data-grid';
import React from 'react';

const OnTrackSelectedIcon = () => (
  <img src={'/images/icons/OnTrackSelectedBg.svg'} alt="on-track" />
);
const OnTrackNotSelectedicon = () => (
  <img src={'/images/icons/OnTrackBg.svg'} alt="on-track" />
);

const AtRiskSelectedIcon = () => (
  <img src={'/images/icons/AtRiskSelectedBg.svg'} alt="at-risk" />
);
const AtRiskNotSelectedIcon = () => (
  <img src={'/images/icons/AtRiskBg.svg'} alt="on-track" />
);

const OffTrackSelectedIcon = () => (
  <img src={'/images/icons/OffTrackSelectedBg.svg'} alt="off-track" />
);
const OffTrackNotSelectedIcon = () => (
  <img src={'/images/icons/OffTrackBg.svg'} alt="off-track" />
);

interface ProjectActualsStatusCellProps {
  disabled: boolean;
  row: ActualAllocationTableRow;
  status: 'On Track' | 'At Risk' | 'Off Track' | 'No Data';
  handleProcessRowUpdate: (
    newRow: GridValidRowModel,
    oldRow: GridValidRowModel
  ) => void;
  setRowValidationErrors: React.Dispatch<
    React.SetStateAction<
      Record<string, { planned: boolean; actuals: boolean; comments: boolean }>
    >
  >;
}

const ProjectActualsStatusCellButton = ({
  disabled,
  status,
  color,
  selected,
  notSelectedIcon,
  selectedIcon,
  handleSelected,
}: {
  disabled: boolean;
  status: string;
  color: string;
  selected: boolean;
  notSelectedIcon: React.ReactNode;
  selectedIcon: React.ReactNode;
  handleSelected: (status: string) => void;
}) => {
  return (
    <Tooltip title={status}>
      <IconButton disabled={disabled} sx={{ padding: 0, marginRight: 0.5 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '4px',
            border: `0.5px solid #D9D9D0`,
            backgroundColor: selected ? color : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
          onClick={() => handleSelected(status)}
        >
          {selected ? selectedIcon : notSelectedIcon}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

const ProjectActualsStatusCell = ({
  disabled,
  row,
  status,
  handleProcessRowUpdate,
  setRowValidationErrors,
}: ProjectActualsStatusCellProps) => {
  const handleSelected = (newStatus: string) => {
    if (status !== newStatus) {
      if (status === 'On Track') {
        setRowValidationErrors(prev => ({
          ...prev,
          [row.id]: { planned: false, actuals: false, comments: false },
        }));
      } else if (status === 'At Risk' || status === 'Off Track') {
        setRowValidationErrors(prev => ({
          ...prev,
          [row.id]: { planned: false, actuals: false, comments: true },
        }));
      }
      handleProcessRowUpdate(
        {
          ...row,
          projectActualsStatus: newStatus,
        },
        row
      );
    } else {
      // If the same status is clicked again, reset to 'No Data'
      setRowValidationErrors(prev => ({
        ...prev,
        [row.id]: { planned: false, actuals: false, comments: false },
      }));

      handleProcessRowUpdate(
        {
          ...row,
          projectActualsStatus: 'No Data',
        },
        row
      );
    }
  };

  return (
    <Box>
      <ProjectActualsStatusCellButton
        disabled={disabled}
        status={'On Track'}
        color="green"
        selected={status === 'On Track'}
        selectedIcon={<OnTrackSelectedIcon />}
        notSelectedIcon={<OnTrackNotSelectedicon />}
        handleSelected={status => handleSelected(status)}
      />
      <ProjectActualsStatusCellButton
        disabled={disabled}
        status={'At Risk'}
        color="orange"
        selected={status === 'At Risk'}
        selectedIcon={<AtRiskSelectedIcon />}
        notSelectedIcon={<AtRiskNotSelectedIcon />}
        handleSelected={status => handleSelected(status)}
      />
      <ProjectActualsStatusCellButton
        disabled={disabled}
        status={'Off Track'}
        color="red"
        selected={status === 'Off Track'}
        selectedIcon={<OffTrackSelectedIcon />}
        notSelectedIcon={<OffTrackNotSelectedIcon />}
        handleSelected={status => handleSelected(status)}
      />
    </Box>
  );
};

export default ProjectActualsStatusCell;
