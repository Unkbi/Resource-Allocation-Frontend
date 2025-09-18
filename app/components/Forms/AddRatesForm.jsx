'use client';

import { Box, TextField } from '@mui/material';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import CustomSelect from '../Select/CustomSelect';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { FETCH_EMPLOYEE_RATES } from '@/app/redux/actions/employeeRatesActions';
import { useDispatch } from 'react-redux';
import StyledAutocomplete from '../Select/Autocomplete';
import { FETCH_LOCATION } from '@/app/redux/actions/allSettingsActions';
import { withRBAC } from '../HOC/withRBAC';

const AddRatesForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}) => {
  const {
    values,
    handleChange,
    handleBlur,
    errors,
    touched,
    resetForm,
    setTouched,
  } = formikProps;
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { employeeRates, loading: employeeRatesLoading } = useSelector(
    state => state.employeeRates
  );
  const { location } = useSelector(state => state.allSettings);
  const [locationOptions, setLocationOptions] = useState([]);
  const { formType } = useSelector(state => state.globalDialog.formState);
  const [readOnly, setReadOnly] = useState(true);
  const dispatch = useDispatch();

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const currencyOptions = [{ value: 'USD', label: 'USD' }];

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_rates' && !permissions['EmployeeRate']?.u) ||
        (formType === 'add_rates' && !permissions['EmployeeRate']?.c)
    );
    if (!employeeRates || employeeRates?.length === 0) {
      dispatch({
        type: FETCH_EMPLOYEE_RATES,
        payload: {},
      });
    }
    if (!location || location?.length === 0) {
      dispatch({ type: FETCH_LOCATION });
    }
  }, []);

  useEffect(() => {
    if (location && Array.isArray(location)) {
      const locationNames =
        location.map(loc => ({
          value: loc.Id,
          label: loc.Name,
        })) || [];
      setLocationOptions(locationNames);
    }
  }, [location]);

  useEffect(() => {
    if (initialData) {
      const matchedLocation = location?.find(
        loc => loc.Name === initialData.WorkLocation
      );

      const rowData = {
        WorkLocation: matchedLocation?.Id || '',
        HRLevel: initialData.HRLevel,
        HourlyRate: initialData.HourlyRate,
        ValidityEndDate: initialData.ValidityEndDate || '',
        ValidityStartDate: initialData.ValidityStartDate || '',
        HourlyRateCurrency: initialData.HourlyRateCurrency || 'USD',
        Status: initialData.Status || 'Active',
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, [initialData]);

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Location <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          name="WorkLocation"
          label="Work Location"
          placeholder="Select Location"
          value={values.WorkLocation || ''}
          options={locationOptions}
          formikProps={formikProps}
          fullWidth
        />
      </Box>
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <StyledLabel>
            HR Level <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledInput
            disabled={readOnly}
            readOnly={readOnly}
            as={TextField}
            name="HRLevel"
            placeholder="Select Level"
            value={values.HRLevel || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.HRLevel && Boolean(errors.HRLevel)}
            helperText={touched.HRLevel && formikProps.errors.HRLevel}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <StyledLabel>
            Is Active <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledAutocomplete
            disabled={readOnly}
            name="Status"
            label="Status"
            placeholder="Select"
            options={statusOptions}
            value={values.Status || ''}
            formikProps={formikProps}
            required
            FormHelperTextProps={{
              style: { marginLeft: 0, marginTop: 4 },
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <StyledLabel>
            Rate/Hr <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledInput
            disabled={readOnly}
            readOnly={readOnly}
            as={TextField}
            type="number"
            name="HourlyRate"
            placeholder="Enter Rates"
            value={values.HourlyRate || ''}
            onChange={e => {
              const input = e.target.value;
              const parsed = input === '' ? null : Number(input);
              formikProps.setFieldValue('HourlyRate', parsed);
            }}
            onKeyDown={e => {
              if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onBlur={handleBlur}
            error={touched.HourlyRate && Boolean(errors.HourlyRate)}
            helperText={touched.HourlyRate && formikProps.errors.HourlyRate}
            InputProps={{
              startAdornment: <span>$&nbsp;</span>,
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <StyledLabel>
            Currency <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledAutocomplete
            disabled={readOnly}
            name="HourlyRateCurrency"
            label="Currency"
            options={currencyOptions}
            value={values.HourlyRateCurrency}
            formikProps={formikProps}
            required
            FormHelperTextProps={{
              style: { marginLeft: 0, marginTop: 4 },
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <CustomDatePicker
            readOnly={readOnly}
            name="ValidityStartDate"
            value={formikProps.values.ValidityStartDate || null}
            formikProps={formikProps}
            error={
              formikProps.touched.ValidityStartDate &&
              Boolean(formikProps.errors.ValidityStartDate)
            }
            helperText={
              formikProps.touched.ValidityStartDate &&
              formikProps.errors.ValidityStartDate
            }
            placeholder="MM/DD/YYYY"
            title={
              <>
                Valid From <span style={{ color: 'red' }}>*</span>
              </>
            }
            isRequired={true}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <CustomDatePicker
            readOnly={readOnly}
            name="ValidityEndDate"
            value={formikProps.values.ValidityEndDate || null}
            formikProps={formikProps}
            error={
              formikProps.touched.ValidityEndDate &&
              Boolean(formikProps.errors.ValidityEndDate)
            }
            helperText={
              formikProps.touched.ValidityEndDate &&
              formikProps.errors.ValidityEndDate
            }
            placeholder="MM/DD/YYYY"
            title={
              <>
                Valid To <span style={{ color: 'red' }}>*</span>
              </>
            }
            isRequired={true}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default withRBAC(AddRatesForm, ['EmployeeRate']);
