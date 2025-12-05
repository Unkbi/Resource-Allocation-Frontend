import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import StyledAutocomplete from '../Select/Autocomplete';
import { withRBAC } from '../HOC/withRBAC';
import { FormikProps } from 'formik';
import { FETCH_BUSINESS_IMPACT, FETCH_BUSINESS_IMPACT_TYPE } from '@/app/redux/actions/businessImpactActions';
import { Project } from '@/app/types';


interface BusinessImpactFormValues {
  Project: string;
  BusinessImpactType: string;
  Amount: string;
  Description: string;
  Status: string;
  Currency: string;
}

interface PermissionMap {
  [key: string]: {
    c?: boolean; // create
    u?: boolean; // update
  };
}

interface AddBusinessImpactFormProps {
  formikProps: FormikProps<BusinessImpactFormValues>;
  setFormValue?: (val: BusinessImpactFormValues) => void;
  permissions: PermissionMap;
}

const AddBusinessImpactForm: React.FC<AddBusinessImpactFormProps> = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}) => {
  const dispatch = useDispatch();
  const initialData = useSelector(
    (state: any) => state.globalDialog.formState.initialData
  );
  const projects: Project[] = useSelector((state: any) => state.projects.projects);
  const formType = useSelector(
    (state: any) => state.globalDialog.formState.formType
  );
  const { businessImpact, businessImpactType} = useSelector((state:any )=> state.businessImpact)
  const [readOnly, setReadOnly] = useState<boolean>(true);
  
  useEffect(() => {
    dispatch({
      type: FETCH_BUSINESS_IMPACT,
      payload: {},
    });
    
  }, []);

   useEffect(() => {
    dispatch({
      type: FETCH_BUSINESS_IMPACT_TYPE,
      payload: {},
    });
  }, []);

  const {
    values,
    handleChange,
    handleBlur,
    errors,
    touched,
    setFieldValue,
    resetForm,
    setTouched,
  } = formikProps;
  
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

   const projectOptions = projects.map(p => ({
    value: p.Id,     
    label: p.Name,
  }));

  const businessImpactTypeOptions = businessImpactType.map((t: any) => ({
    value: t.Id,      
    label: t.Name,
  }));

  
  useEffect(() => {
    if (initialData) {
      const rowData: BusinessImpactFormValues = {
        Project: initialData.Project || '',
        BusinessImpactType: initialData.BusinessImpactType || '',
        Amount: initialData.Amount || '',
        Description: initialData.Description || '',
        Status: initialData.Status || '',
        Currency :initialData.Currency || 'USD',
      };
      setFormValue(rowData);
      resetForm({ values: rowData });
      setTouched({});
    }
  }, [initialData, projects]);
  

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_business_impact' && !permissions?.['BusinessImpact']?.u) ||
        (formType === 'add_business_impact' && !permissions?.['BusinessImpact']?.c)
    );
  }, [formType, permissions]);

  return (
    <Box>
      <StyledLabel>
        Project <span style={{ color: 'red' }}> *</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledAutocomplete
          name="Project"
          label="Select Project"
          disabled={readOnly}
          readOnly={readOnly}
          placeholder="Select Project"
          options={projectOptions}
          value={values.Project || ''}
          formikProps={formikProps}
          fullWidth
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Business Impact Type <span style={{ color: 'red' }}> *</span>
        </StyledLabel>
        <StyledAutocomplete
          name="BusinessImpactType"
          label="Select Business Impact Type"
          disabled={readOnly}
          readOnly={readOnly}
          placeholder="Select Business Impact Type"
          options={businessImpactTypeOptions}
          value={values.BusinessImpactType || ''}
          formikProps={formikProps}
          fullWidth
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Annualized Amount ($) <span style={{ color: 'red' }}> *</span>
        </StyledLabel>
        <StyledInput
          name="Amount"
          placeholder="Enter Annualized Amount"
          type="number"
          disabled={readOnly}
          readOnly={readOnly}
          value={values.Amount || ''}
          onChange={handleChange}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            const trimmed = e.target.value.trim();
            setFieldValue('Amount', trimmed);
            handleBlur(e);
          }}
           onKeyDown={(e:any )=> {
              if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                e.preventDefault();
              }
            }}
          error={touched.Amount && Boolean(errors.Amount)}
          helperText={touched.Amount && errors.Amount}
        />
      </Box>

      <StyledLabel>Description <span style={{ color: 'red' }}> *</span></StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="Description"
          placeholder="Enter Description"
          disabled={readOnly}
          readOnly={readOnly}
          value={values.Description || ''}
          onChange={handleChange}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            const trimmed = e.target.value.trim();
            setFieldValue('Description', trimmed);
            handleBlur(e);
          }}
          error={touched.Description && Boolean(errors.Description)}
          helperText={touched.Description && errors.Description}
        />
      </Box>

      <Box sx={{ flex: 1, pb: 2 }}>
        <StyledLabel>
          Status <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          name="Status"
          label="Select Status"
          disabled={readOnly}
          readOnly={readOnly}
          placeholder="Select status"
          options={statusOptions}
          value={values.Status || ''}
          formikProps={formikProps}
          fullWidth
        />
      </Box>
    </Box>
  );
};

export default withRBAC(AddBusinessImpactForm, ['BusinessImpact', 'Portfolio']);
// export default AddBusinessImpactForm;
