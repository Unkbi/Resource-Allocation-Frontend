'use client';

import {
  Box,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import StyledLabel from '../Label/StyledLabel';
import { StyledFormHelperText, StyledInput } from '../Input/StyledInput';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { FormikProps } from 'formik';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import { Entity } from '@/app/types';
import StyledAutocomplete from '../Select/Autocomplete';

type ActionType = 'Create' | 'Read' | 'Update' | 'Delete';

interface PrivilegeFormValues {
  Name: string;
  Resource: string;
  Actions: Record<ActionType, boolean>;
}
interface AddPrivilegeFormProps {
  formikProps: FormikProps<PrivilegeFormValues>;
  setFormValue?: (values: PrivilegeFormValues) => void;
  permissions: Record<string, CrudPermissions>;
}

const AddPrivilegeForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}: AddPrivilegeFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, errors, touched } =
    formikProps;
  const [privilegeName, setPrivilegeName] = useState('');
  const { initialData, formType } = useSelector(
    (state: any) => state.globalDialog.formState
  );
  const [readOnly, setReadOnly] = useState(true);
  const meta = useSelector((state: any) => state.rbac.meta);

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_privilege' && !permissions['Permission']?.u) ||
        (formType === 'add_privilegee' && !permissions['Permission']?.c)
    );
  }, []);

  useEffect(() => {
    if (initialData) {
      const actionObject: Record<ActionType, boolean> = {
        Create: initialData.c ?? false,
        Read: initialData.r ?? false,
        Update: initialData.u ?? false,
        Delete: initialData.d ?? false,
      };

      const rowData: PrivilegeFormValues = {
        Name: initialData.id || '',
        Resource: Array.isArray(initialData.resourceFqName)
          ? initialData.resourceFqName[0] || ''
          : initialData.resourceFqName || '',
        Actions: actionObject,
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, [initialData]);

  const actionList: ActionType[] = ['Create', 'Read', 'Update', 'Delete'];
  const actionError =
    formikProps.touched.Actions &&
    typeof formikProps.errors.Actions === 'string'
      ? formikProps.errors.Actions
      : undefined;

  const resourceEntities = meta?.entities?.Resource ?? [];
  const authEntities = meta?.entities?.['agentlang.auth'] ?? [];
  const allEntities = [...resourceEntities, ...authEntities];
  const resourceOptions = allEntities.map((entity: Entity) => ({
    value: entity.fqName,
    label:
      entity.fqName?.split('/').length >= 2
        ? entity.fqName?.split('/')[1]
        : (entity.fqName ?? ''),
  }));

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Privilege Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          disabled={readOnly}
          readOnly={readOnly}
          as={TextField}
          name="Name"
          placeholder="Enter Privilege Name"
          value={values.Name || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(e);
            setPrivilegeName(e.target.value);
          }}
          onBlur={
            handleBlur as React.FocusEventHandler<
              HTMLInputElement | HTMLTextAreaElement
            >
          }
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && errors.Name}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Entity <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          name="Resource"
          label="Select Entity"
          options={resourceOptions}
          value={values.Resource || ''}
          formikProps={formikProps}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel sx={{ px: 0.3 }}>
          Actions (CRUD) <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <FormGroup>
          {actionList.map(action => (
            <FormControlLabel
              key={action}
              sx={{
                '& .MuiFormControlLabel-label.Mui-disabled': {
                  //@ts-ignore
                  color: theme => theme.palette.readonly.contrastText,
                },
              }}
              control={
                <Checkbox
                  disabled={readOnly}
                  size="small"
                  name={`Actions.${action}`}
                  checked={values.Actions?.[action] || false}
                  onChange={e =>
                    setFieldValue(`Actions.${action}`, e.target.checked)
                  }
                  onBlur={() => formikProps.setFieldTouched('Actions', true)}
                  sx={{
                    '&.Mui-disabled': {
                      cursor: 'default',
                    },
                    '&.MuiCheckbox-root.Mui-disabled': {
                      //@ts-ignore
                      color: theme => theme.palette.readonly.contrastText,
                    },
                  }}
                />
              }
              label={action}
            />
          ))}
        </FormGroup>
        {actionError && (
          <StyledFormHelperText
            sx={{
              marginLeft: '3px',
              mt: 0.5,
            }}
            error
          >
            {actionError}
          </StyledFormHelperText>
        )}
      </Box>
    </Box>
  );
};

export default withRBAC(AddPrivilegeForm, ['Permission']);
