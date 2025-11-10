import React, { useEffect } from 'react';
import { Box, FormControlLabel, Checkbox } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import ChipInput from '../Input/ChipInput';
import { FormikProps } from 'formik';
import { ResourceToUserFormValues } from '@/app/types';
import StyledAutocomplete from '../Select/Autocomplete';
import { FETCH_ROLES } from '@/app/redux/actions/rbacActions';
import { closeDialog } from '@/app/redux/reducers/dialogReducer';
import {useRouter} from 'next/navigation';

interface AddResourceToUserFormProps {
  formikProps: FormikProps<ResourceToUserFormValues>;
  setFormValue?: (values: ResourceToUserFormValues) => void;
}

const AddResourceToUserForm = ({
  formikProps,
  setFormValue = () => {},
}: AddResourceToUserFormProps) => {
  const {
    values,
    handleChange,
    handleBlur,
    setFieldValue,
    touched,
    setTouched,
    resetForm,
    errors,
  } = formikProps;
  const dispatch = useDispatch<any>();
  const { initialData } = useSelector(
    (state: any) => state.globalDialog.formState || {}
  );
  // const { resources } = useSelector((state: any) => state.resources || {});
  const {roles} = useSelector((state:any)=> state.rbac || {})
  const seenValues = new Set<string>();
  const router = useRouter();
  const [showMessage, setShowMessage] = React.useState(true);
  const roleOptions: { value: string; label: string; id: string }[] = (
    roles || []
  )
    .map((role: any) => ({
      value: role.name,
      label: role.name,
      id: role.name,
    }))
    .filter((option: any) => {
      if (seenValues.has(option.value)) return false;
      seenValues.add(option.value);
      return true;
    });

  useEffect(() => {
    if (initialData) {
      const obj = {
        Resources: initialData?.map((item: any) => item.email) || [],
        Role: initialData?.role || '',
        sendInviteEmail: initialData?.sendInviteEmail || true,
      };
      setFormValue(obj);
      resetForm({ values: obj });
      setTouched({});
    }
  }, [initialData]);

  useEffect(() => {
    if (!roles || roles.length === 0) {
      dispatch({type: FETCH_ROLES});
    }
  }, [dispatch, roles]);

  const handleNavigate = () => {
    dispatch(closeDialog());
    router.replace("/settings?menu=access-management&tab=role-assignments");
  };


  return (
    <Box>
      <StyledLabel>
        Resources <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <ChipInput
          value={values?.Resources || []}
          onChange={(updatedResources) => {
            setFieldValue('Resources', updatedResources);
          }}
          placeholder="No resources selected"
          error={touched?.Resources && Boolean(errors?.Resources)}
          helperText={touched?.Resources && errors?.Resources ? String(errors.Resources) : undefined}
        />
      </Box>

      <Box sx={{ flex: 1 }}>
        <StyledLabel>
          Role Assignment <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          name="Role"
          label="Role"
          placeholder="Select Role"
          value={values.Role || ''}
          options={roleOptions}
          required
          formikProps={formikProps}
          fullWidth
        />
      </Box>

    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 1,
      }}
    >
      <FormControlLabel
        sx={{ mr: 0 }}
        control={
          <Checkbox
            name="sendInviteEmail"
            checked={values.sendInviteEmail || false}
            onChange={(e) => {
              setFieldValue('sendInviteEmail', e.target.checked);
            }}
            color="primary"
            sx={{ 
              m: 0,
              '& .MuiSvgIcon-root': {
                fontSize: '18px',
              }
            }}
          />
        }
        label=""
      />
      <StyledLabel sx={{ pb: 0, ml: 0, pl: 0, color: '#555555', fontWeight: 400 }}>
        An invite will be sent to the user via email.
      </StyledLabel>
    </Box>

    <Box sx={{ 
      display: showMessage ? 'block' : 'none',
      mt: 2, 
      p: 2, 
      backgroundColor: '#f5f5f5', 
      borderRadius: '4px',
      border: '1px solid #e0e0e0',
      position: 'relative'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        gap: 1
      }}>
        <img
          src="/images/icons/ErrorIcon.svg"
          alt="Error"
          style={{ 
            width: 20, 
            height: 20, 
            marginTop: 2,
            flexShrink: 0
          }}
        />
        <Box sx={{ flex: 1 }}>
        <Box sx={{ 
          fontWeight: 500, 
          fontSize: '14px', 
          color: '#030712',
          mb: 0.5
        }}>
          Important Message
        </Box>
        <Box sx={{ 
          fontSize: '12px', 
          color: '#030712',
          fontWeight: 400,
          lineHeight: 1.4
        }}>
          The interface restricts a user to a single role at any given time.<br/>
          Modification & Permissions are managed in <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={handleNavigate}>Access Management</span>.
        </Box>
        </Box>
        <Box 
          sx={{
            cursor: 'pointer',
            color: '#666',
            fontSize: '18px',
            fontWeight: 'bold',
            lineHeight: 1,
            '&:hover': {
              color: '#030712'
            }
          }}
          onClick={() => setShowMessage(false)}
        >
          ×
        </Box>
      </Box>
    </Box>
    </Box>
  );
};

export default AddResourceToUserForm;
