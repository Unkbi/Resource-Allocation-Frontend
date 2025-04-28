import { Box, Button, Autocomplete, TextField, MenuItem, ListItemText, InputAdornment, Chip } from '@mui/material';
import { useState } from 'react';
import { useSelector } from "react-redux";
import { RootState } from '@/app/redux/store';
import { GridValidRowModel } from '@mui/x-data-grid-premium';
import SearchIcon from '@mui/icons-material/Search';

interface Project {
  Id: any;
  Name: string;
}

interface ProjectMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  setRows: React.Dispatch<React.SetStateAction<readonly GridValidRowModel[]>>;
  existingRows: readonly GridValidRowModel[];
}

const ProjectMenu = ({ anchorEl, onClose, setRows, existingRows }: ProjectMenuProps) => {
  const [searchValue, setSearchValue] = useState<string>('');  
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]); 
  const { projects } = useSelector((state: RootState) => state.projects);
  const projectList: Project[] = Array.isArray(projects?.result) ? projects.result : [];

  const filteredProjects = projectList.filter((project) =>
    project.Name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleProjectSelect = (project: Project) => {
    if (!selectedProjects.some(p => p.Id === project.Id)) {
      setSelectedProjects([...selectedProjects, project]);
    }
  };

  const handleDone = () => {
    const newRows = selectedProjects.map((project, index) => ({
      id: Date.now() + index,
      project: project.Name,
      planned: 0,
      actuals: 0.1,
      comments: '',
    }));

    setRows([...existingRows, ...newRows]);
    onClose();
  };

  return (
    <Box
      sx={{
        width: '221px',
        maxHeight: '375px',
        flexShrink: 0,
        padding: 2,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{
          width: 24,
          height: 44,}}>
      <Button
        onClick={onClose}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
        }}
      >
        <img
          src="/images/icons/back-btn.svg"
          alt="Back"
          style={{ width: 24, height: 24, marginRight: 8 }}
        />
      </Button>
      </Box>

      <Box sx={{ mb: 2, position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff', paddingBottom: 2 }}>
        <Autocomplete
          multiple
          freeSolo
          value={selectedProjects}
          onChange={(event, newValue) => {
            const selected = newValue.filter((value): value is Project => typeof value !== 'string');
            setSelectedProjects(selected);
          }}
          options={filteredProjects}
          getOptionLabel={(result) => (typeof result !== 'string' ? result.Name : '')}
          disableCloseOnSelect
          open={false}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search"
              variant="outlined"
              sx={{
                width: '188px',
                backgroundColor: 'rgba(242, 245, 250, 0.30)',
                borderRadius: 1,
                border: '1px solid #D6DCE1',
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: '#D6DCE1' }} />
                  </InputAdornment>
                ),
              }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          )}
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
        }}
      >
        {selectedProjects.map((project) => (
          <Chip
            key={project.Id} 
            label={project.Name}
            onDelete={() => setSelectedProjects(selectedProjects.filter(p => p.Id !== project.Id))}
            sx={{ marginRight: 1, marginBottom: 1 }}
          />
        ))}
        {filteredProjects.length === 0 ? (
          <MenuItem disabled key="no-projects">
            <ListItemText primary="No projects found" />
          </MenuItem>
        ) : (
          filteredProjects.map((project) => (
            <MenuItem
              key={project.Id} 
              sx={{
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: '#f1f1f1',
                },
              }}
              onClick={() => handleProjectSelect(project)}
            >
              <ListItemText primary={project.Name} /> 
            </MenuItem>
          ))
        )}
      </Box>
      <Box>
        <Button onClick={handleDone} sx={{ marginTop: 2 }}>
          Done
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectMenu;
