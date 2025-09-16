'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { MuiColorInput } from 'mui-color-input';
import { FormikProps } from 'formik';
import { StyledCommentInput, StyledInput } from '../Input/StyledInput';

export interface ProjectType {
  Name: string;
  ProjectTypeGroup?: string;
  Description?: string;
  Color?: string;
  Status?: string;
}

interface AddProjectTypesForm {
  formikProps: FormikProps<ProjectType>;
  setFormValue: (value: ProjectType) => void;
}

const AddProjectTypesForm = ({ formikProps, setFormValue = () => {} }: AddProjectTypesForm) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const [projectTypeGroupName, setProjectTypeGroupName] = useState([]);
  const { initialData } = useSelector((state: any) => state.globalDialog.formState);
  const { projectTypeGroups } = useSelector((state: any) => state.allSettings);
  const [description, setDescription] = useState('');
  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

  useEffect(() => {
    setProjectTypeGroupName(projectTypeGroups || []);
    
    if (initialData) {
      const rowData = {
        Name: initialData.Name || '',
        ProjectTypeGroup: initialData.projectTypesGroup || '',
        Description: initialData.description || '',
        Status: initialData.Status || 'Active',
        Color: initialData.Color || '#CCE0FF',
      };
       setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});     
    }
  }, [initialData, projectTypeGroups]);

  const handleAutocompleteChange =
    (field: string) => (_event: any, newValue: any) => {
      if (field === 'ProjectTypeGroup') {
        setFieldValue(field, newValue?.Name || '');
      } else {
        setFieldValue(field, newValue || '');
      }
    };

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Project Type Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          placeholder="Enter Name"
          fullWidth
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.Name || ''}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && errors.Name}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          {' '}
          Project Type Group <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={projectTypeGroupName}
          getOptionLabel={(option: any) => option.Name || ''}
          value={
            projectTypeGroupName.find(
              (group: any) => group.Name === values.ProjectTypeGroup
            ) || null
          }
          onChange={handleAutocompleteChange('ProjectTypeGroup')}
          onBlur={() => formikProps.setFieldTouched('ProjectTypeGroup', true)}
          renderInput={params => (
            <TextField
              {...params}
              name="ProjectTypeGroup"
              placeholder="Select Group"
              variant="outlined"
              error={
                touched.ProjectTypeGroup && Boolean(errors.ProjectTypeGroup)
              }
              helperText={touched.ProjectTypeGroup && errors.ProjectTypeGroup}
              slotProps={{
                formHelperText: {
                  sx: { fontSize: '12px', textAlign: 'left', ml: 0 },
                },
              }}
            />
          )}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Description
        </StyledLabel>
        <StyledCommentInput
          as={TextField}
          multiline
          rows={5}
          name="Description"
          placeholder="Enter Description"
          fullWidth
          onChange={e => {
            handleChange(e);
            setDescription(e.target.value);
          }}
          sx={{
            '& .MuiInputBase-input-MuiOutlinedInput-input': {
              marginTop: '10px',
            },
          }}
          onBlur={handleBlur}
          value={values.Description || ''}
          error={touched.Description && Boolean(errors.Description)}
          helperText={touched.Description && errors.Description}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>Color</StyledLabel>
        <MuiColorInput
          name="Color"
          format="hex"
          value={values.Color ?? '#CCE0FF'}
          onChange={e => {
            setFieldValue('Color', e);
          }}
          size="small"
          sx={{
            width: '100%',
            '& .MuiColorInput-input': {
              width: '100%',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: '#CCE0FF',
              border: '1px solid #ccc',
            },
            '& .MuiInputBase-input': {
              fontSize: '14px',
            },
          }}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>Status  <span style={{ color: 'red' }}>*</span></StyledLabel>
        <Autocomplete
          disableClearable
          sx={commonAutocompleteStyles}
          size="small"
          options={['Active', 'Inactive']}
          value={values.Status || 'Active'}
          onChange={handleAutocompleteChange('Status')}
          renderInput={params => (
            <TextField
              {...params}
              name="Status"
              error={touched.Status && Boolean(errors.Status)}
              helperText={touched.Status && errors.Status}
              slotProps={{
                formHelperText: {
                  sx: { fontSize: '12px', textAlign: 'left', ml: 0 },
                },
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default AddProjectTypesForm;
