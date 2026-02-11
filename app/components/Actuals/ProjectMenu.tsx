import {
  Box,
  Button,
  Chip,
  IconButton,
  Popper,
  TextField,
  Typography,
} from '@mui/material';
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import { GridValidRowModel } from '@mui/x-data-grid-premium';
import SearchIcon from '@mui/icons-material/Search';
import { UNPLANNED_PROJECT } from '@/app/constants/constants';

interface Project {
  Id: string | number;
  Name: string;
}

interface ProjectMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  existingRows: readonly GridValidRowModel[];
  onAddProjects: (projects: GridValidRowModel[]) => void;
}

const sharedFontStyles = {
  fontFamily: 'Open Sans',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: 'normal',
};

const chipLabelStyles = {
  color: '#1C2D5F',
  fontWeight: 600,
  lineHeight: '34px',
  backgroundColor: '#fff',
  border: '1px solid #1C2D5F',
  '& .MuiChip-deleteIcon': {
    color: '#1C2D5F',
  },
};

const scrollStyles = {
  maxHeight: 160,
  overflowY: 'auto',
  mb: 1,
  pr: 1,
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#C4CAD4',
    borderRadius: '4px',
    border: '2px solid transparent',
    backgroundClip: 'content-box',
    minHeight: '30px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#A8B0BA',
  },
};

const textFieldStyles = {
  '& .MuiInputBase-input': {
    ...sharedFontStyles,
    color: '#000',
    textAlign: 'left',
  },
  '& .MuiInputBase-input::placeholder': {
    ...sharedFontStyles,
    color: '#757575',
    textAlign: 'left',
  },
};

const ProjectMenu = ({
  anchorEl,
  onClose,
  existingRows,
  onAddProjects,
}: ProjectMenuProps) => {
  const open = Boolean(anchorEl);
  const { projects } = useSelector((state: RootState) => state.projects);
  const [searchValue, setSearchValue] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);

  const existingProjectIds = existingRows
    .filter(row => row.id !== 'divider')
    .map(row => row.project);

  const filteredProjects = useMemo(() => {
    const projectList = Array.isArray(projects) ? projects : [];
    return projectList.filter(
      project =>
        project.Name.toLowerCase().includes(searchValue.toLowerCase()) &&
        !selectedProjects.some(p => p.Id === project.Id) &&
        !existingProjectIds.includes(project.Name)
    );
  }, [projects, searchValue, selectedProjects, existingProjectIds]);

  const handleToggle = (project: Project) => {
    const exists = selectedProjects.find(p => p.Id === project.Id);
    if (exists) {
      setSelectedProjects(prev => prev.filter(p => p.Id !== project.Id));
    } else {
      setSelectedProjects(prev => [...prev, project]);
    }
  };

  const handleDelete = (projectId: string | number) => {
    setSelectedProjects(prev => prev.filter(p => p.Id !== projectId));
  };

  const handleDone = () => {
    const newRows = selectedProjects.map((project, index) => ({
      id: `${Date.now()}_project_${index}`,
      project: project.Name,
      planned: 0,
      actuals: 0,
      comments: '',
      type: UNPLANNED_PROJECT,
    }));

    if (newRows.length > 0) {
      onAddProjects(newRows);
    }

    onClose();
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: 1300 }}
    >
      <Box
        sx={{
          width: 231,
          padding: 1,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            width: 24,
            height: 24,
            padding: 0,
            mb: 1,
            alignSelf: 'flex-start',
          }}
        >
          <Box
            component="img"
            src="/images/icons/back-btn.svg"
            alt="Back"
            sx={{ width: 20, height: 20 }}
          />
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.5,
            backgroundColor: 'rgba(242, 245, 250, 0.30)',
            borderRadius: 1,
            border: '1px solid #D6DCE1',
            padding: '4px 8px',
            mb: 1,
            minHeight: 40,
          }}
        >
          {selectedProjects.map(project => (
            <Chip
              key={project.Id}
              label={project.Name}
              onDelete={() => handleDelete(project.Id)}
              size="small"
              sx={{ ...sharedFontStyles, ...chipLabelStyles }}
            />
          ))}
          <TextField
            variant="standard"
            placeholder={selectedProjects.length === 0 ? 'Search' : ''}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            slotProps={{
              input: {
                disableUnderline: true,
                endAdornment: (
                  <SearchIcon sx={{ color: '#344665', fontSize: 18, ml: 1 }} />
                ),
                sx: textFieldStyles,
              },
            }}
            sx={{
              flex: 1,
              minWidth: 20,
            }}
          />
        </Box>

        <Box sx={scrollStyles}>
          {filteredProjects.map(project => {
            const isSelected = selectedProjects.some(p => p.Id === project.Id);
            return (
              <Box
                key={project.Id}
                onClick={() => handleToggle(project)}
                sx={{
                  px: 1,
                  py: 0.5,
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? 'rgba(25, 118, 210, 0.1)'
                    : 'transparent',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    ...sharedFontStyles,
                    fontSize: '13px',
                    color: '#424242',
                    lineHeight: '34px',
                  }}
                >
                  {project.Name}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            border: '1px solid #D6DCE1',
            marginBottom: '1px',
            lineHeight: '30px',
          }}
        />

        <Button
          variant="text"
          onClick={handleDone}
          sx={{
            width: 70,
            height: 36,
            alignSelf: 'flex-end',
            marginRight: '10px',
            textTransform: 'none',
            color: '#1C2D5F',
            ...sharedFontStyles,
            fontWeight: 600,
            lineHeight: '30px',
            cursor: 'pointer',
            justifyContent: 'flex-end',
            padding: 0,
            minWidth: 0,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          DONE
        </Button>
      </Box>
    </Popper>
  );
};

export default ProjectMenu;
