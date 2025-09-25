'use client';

import { Box, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { MuiColorInput } from 'mui-color-input';
import { FormikProps } from 'formik';
import { StyledCommentInput, StyledInput } from '../Input/StyledInput';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { RootState } from '@/app/redux/store';
import StyledAutocomplete from '../Select/Autocomplete';
import { ProjectTypeGroup } from '@/app/types';

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
  permissions: Record<string, CrudPermissions>;
}

const AddProjectTypesForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}: AddProjectTypesForm) => {
  const theme = useTheme();
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const [projectTypeGroupName, setProjectTypeGroupName] = useState<
    ProjectTypeGroup[]
  >([]);
  const { initialData } = useSelector(
    (state: RootState) => state.globalDialog.formState
  );
  const { projectTypeGroups } = useSelector(
    (state: RootState) => state.allSettings
  );
  const { formType } = useSelector(
    (state: RootState) => state.globalDialog.formState
  );
  const [readOnly, setReadOnly] = useState(true);
  const [description, setDescription] = useState('');
  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_project_type' && !permissions['ProjectType']?.u) ||
        (formType === 'add_project_type' && !permissions['ProjectType']?.c)
    );
  }, []);

  useEffect(() => {
    setProjectTypeGroupName(projectTypeGroups || []);

    if (initialData) {
      const matchedProjectTypeGroup = projectTypeGroups.find(
        pTGrp => pTGrp.Name === initialData.projectTypesGroup
      );
      const rowData = {
        Name: initialData.Name || '',
        ProjectTypeGroup: matchedProjectTypeGroup?.Id || '',
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

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const projectTypeGroupNameOptions =
    projectTypeGroupName?.map((projectTypeGroup: ProjectTypeGroup) => ({
      value: projectTypeGroup.Id,
      label: projectTypeGroup.Name ?? '',
    })) || [];

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Project Type Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          disabled={readOnly}
          readOnly={readOnly}
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
        <StyledAutocomplete
          disabled={readOnly}
          name="ProjectTypeGroup"
          label="Select Project Type Group"
          options={projectTypeGroupNameOptions}
          value={values.ProjectTypeGroup || ''}
          formikProps={formikProps}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>Description</StyledLabel>
        <StyledCommentInput
          disabled={readOnly}
          as={TextField}
          multiline
          rows={5}
          name="Description"
          placeholder={readOnly ? '' : 'Enter Description'}
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
          disabled={readOnly}
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
            '& .Mui-disabled': {
              //@ts-ignore
              backgroundColor: theme.palette.readonly?.main ?? '#f3f3f3', // fallback if not defined
              cursor: 'default',
            },
            '& .Mui-disabled .MuiInputBase-input': {
              color: '#6B7280 !important',
              WebkitTextFillColor:
                //@ts-ignore
                theme.palette.readonly?.contrastText ?? '#333', // fallback if not defined
            },
          }}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Status <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          name="Status"
          label="Status"
          options={statusOptions}
          value={values.Status || ''}
          formikProps={formikProps}
        />
      </Box>
    </Box>
  );
};

export default withRBAC(AddProjectTypesForm, ['ProjectType']);
