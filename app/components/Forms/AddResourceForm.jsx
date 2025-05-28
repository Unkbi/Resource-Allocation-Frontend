import {
  TextField,
  Box,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import { useDispatch } from 'react-redux';
import { FETCH_ORGANISATIONS } from '@/app/redux/actions/organizationsAction';
import { getResourceDetail } from '@/app/services/teamServices';

const AddResourceForm = ({ formikProps, setFormValue }) => {
  const {
    values,
    handleChange,
    handleBlur,
    errors,
    touched,
    resetForm,
    setTouched,
    setFieldValue,
  } = formikProps;
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { resources } = useSelector(state => state.resources);
  const { teams } = useSelector(state => state.teams);
  const { organisations } = useSelector(state => state.organisations);
  const resourceListOptions =
    resources &&
    resources?.result?.map(resource => {
      return { value: resource.Id, label: resource.FullName };
    });
  const organisationListOptions =
    organisations?.map(org => ({
      value: org.Id,
      label: org.Name,
    })) || [];
  const teamListOptions =
    teams?.result?.map(team => ({
      value: team.Id,
      label: team.Name,
    })) || [];
  const dispatch = useDispatch();

  useEffect(() => {
    const firstNameToUse =
      values.PreferredFirstName?.trim() || values.FirstName;
    const fullName = [firstNameToUse, values.LastName]
      .filter(Boolean)
      .join(' ');
    if (values.FullName !== fullName) {
      formikProps.setFieldValue('FullName', fullName);
    }
  }, [values.PreferredFirstName, values.FirstName, values.LastName]);

  useEffect(() => {
    const loadAndSetForm = async () => {
      if (!initialData || !initialData.Id) return;

      const matchedTeam = teams?.result?.find(
        team => team.Name === initialData.Team
      );
      const matchedOrg = organisations?.find(
        org => org.Name === initialData.Organization
      );

      const rowData = {
        StartDate: initialData.StartDate || null,
        EndDate: initialData.EndDate || null,
        WorkLocation: initialData.WorkLocation || null,
        Manager: initialData.Manager || '',
        FirstName: initialData.FirstName || '',
        LastName: initialData.LastName || '',
        PreferredFirstName: initialData.PreferredFirstName || '',
        Type: initialData.Type || '',
        Status: initialData.Status || 'Active',
        Email: initialData.Email || '',
        HRLevel: initialData.HRLevel || '',
        ContractorHourlyRate: initialData.ContractorHourlyRate || null,
        AverageWeeklyHours: initialData.AverageWeeklyHours || null,
        Department: initialData.Department || '',
        Role: initialData.Role || '',
        PhoneNumber: initialData.PhoneNumber || '',
        LocationCategory: initialData.LocationCategory || '',
        Team: matchedTeam?.Id || '',
        Organisation: matchedOrg?.Id || '',
      };

      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    };

    loadAndSetForm();
  }, [initialData?.Id]);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const typeOptions = [
    { value: 'FTE', label: 'FTE' },
    { value: 'Contractor - FT', label: 'Contractor - FT' },
    { value: 'Contractor - PT', label: 'Contractor - PT' },
    { value: 'Intern', label: 'Intern' },
    { value: 'Temp', label: 'Temp' },
    { value: 'Vendor', label: 'Vendor' },
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!organisations || organisations.length === 0) {
      dispatch({
        type: FETCH_ORGANISATIONS,
        payload: {},
      });
    }
  }, []);

  return (
    <Box>
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
            First Name <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledInput
            name="FirstName"
            placeholder="Enter first name"
            value={values.FirstName || ''}
            onChange={handleChange}
            onBlur={e => {
              const trimmedValue = e.target.value.trim();
              setFieldValue('FirstName', trimmedValue);
              handleBlur(e);
            }}
            error={touched.FirstName && Boolean(errors.FirstName)}
            helperText={touched.FirstName && errors.FirstName}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StyledLabel>
            Last Name <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledInput
            name="LastName"
            placeholder="Enter last name"
            value={values.LastName || ''}
            onChange={handleChange}
            onBlur={e => {
              const trimmedValue = e.target.value.trim();
              setFieldValue('LastName', trimmedValue);
              handleBlur(e);
            }}
            error={touched.LastName && Boolean(errors.LastName)}
            helperText={touched.LastName && errors.LastName}
          />
        </Box>
      </Box>

      <StyledLabel>Preferred First Name</StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="PreferredFirstName"
          placeholder="Enter preferred first name"
          value={values.PreferredFirstName || ''}
          onChange={handleChange}
          onBlur={e => {
            const trimmedValue = e.target.value.trim();
            setFieldValue('PreferredFirstName', trimmedValue);
            handleBlur(e);
          }}
          error={
            touched.PreferredFirstName && Boolean(errors.PreferredFirstName)
          }
          helperText={touched.PreferredFirstName && errors.PreferredFirstName}
        />
      </Box>

      <StyledLabel>
        Email ID <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="Email"
          placeholder="Enter email"
          value={values.Email || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Email && Boolean(errors.Email)}
          helperText={touched.Email && errors.Email}
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
        <Box sx={{ flex: 1, width: '50%' }}>
          <StyledLabel>Phone Number</StyledLabel>
          <StyledInput
            name="PhoneNumber"
            placeholder="Enter phone number"
            value={values.PhoneNumber || ''}
            onChange={e => {
              const numericOnly = e.target.value.replace(/\D/g, '');
              formikProps.setFieldValue('PhoneNumber', numericOnly);
            }}
            onBlur={handleBlur}
            error={touched.PhoneNumber && Boolean(errors.PhoneNumber)}
            helperText={touched.PhoneNumber && errors.PhoneNumber}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <StyledLabel>Department</StyledLabel>
          <StyledInput
            name="Department"
            width={'100%'}
            placeholder="Enter Department"
            value={values.Department || ''}
            onChange={handleChange}
            onBlur={e => {
              const trimmedValue = e.target.value.trim();
              setFieldValue('Department', trimmedValue);
              handleBlur(e);
            }}
            error={touched.Department && Boolean(errors.Department)}
            helperText={touched.Department && errors.Department}
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
        <Box sx={{ flex: 1, width: '50%' }}>
          <StyledLabel>
            Organization <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <CustomSelect
            name="Organisation"
            width={'100%'}
            placeholder="Enter organization"
            value={values.Organisation || ''}
            options={organisationListOptions}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.Organisation && Boolean(errors.Organisation)}
            helperText={touched.Organisation && errors.Organisation}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StyledLabel>
            Role <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledInput
            name="Role"
            placeholder="Enter role"
            value={values.Role || ''}
            onChange={handleChange}
            onBlur={e => {
              const trimmedValue = e.target.value.trim();
              setFieldValue('Role', trimmedValue);
              handleBlur(e);
            }}
            error={touched.Role && Boolean(errors.Role)}
            helperText={touched.Role && errors.Role}
          />
        </Box>
      </Box>

      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          width: '100%',
          gap: 1,
        }}
      >
        <Box sx={{ width: '50%' }}>
          <StyledLabel>HR Level</StyledLabel>
          <StyledInput
            name="HRLevel"
            placeholder="Enter level"
            value={values.HRLevel || ''}
            onChange={e => {
              const input = e.target.value;
              if (/^\d*$/.test(input)) {
                formikProps.setFieldValue('HRLevel', input);
              }
            }}
            onBlur={handleBlur}
            error={touched.HRLevel && Boolean(errors.HRLevel)}
            helperText={touched.HRLevel && errors.HRLevel}
          />
        </Box>

        <Box sx={{ width: '50%' }}>
          <StyledLabel>
            Resource Type <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <CustomSelect
            name="Type"
            options={typeOptions}
            width={'100%'}
            value={values.Type || ''}
            onChange={e => {
              if (
                e.target.value !== 'Contractor - FT' ||
                e.target.value !== 'Contractor - PT'
              ) {
                formikProps.setFieldValue('ContractorHourlyRate', null);
                formikProps.setFieldValue('AverageWeeklyHours', null);
              }
              handleChange(e);
            }}
            onBlur={handleBlur}
            error={touched.Type && Boolean(errors.Type)}
            helperText={formikProps.errors.Type}
          />
        </Box>
      </Box>

      {(values.Type === 'Contractor - FT' ||
        values.Type === 'Contractor - PT') && (
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
            <StyledLabel>Hourly Rate</StyledLabel>
            <StyledInput
              type="number"
              name="ContractorHourlyRate"
              placeholder="Enter rate"
              value={values.ContractorHourlyRate ?? ''}
              onChange={e => {
                const input = e.target.value;
                const parsed = input === '' ? null : Number(input);
                formikProps.setFieldValue('ContractorHourlyRate', parsed);
              }}
              onBlur={handleBlur}
              error={
                touched.ContractorHourlyRate &&
                Boolean(errors.ContractorHourlyRate)
              }
              helperText={
                touched.ContractorHourlyRate && errors.ContractorHourlyRate
              }
              onKeyDown={e => {
                if (['e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              InputProps={{
                startAdornment: <span>$&nbsp;</span>,
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StyledLabel>Avg. Weekly Hrs</StyledLabel>
            <StyledInput
              type="number"
              name="AverageWeeklyHours"
              placeholder="Enter hours"
              value={values.AverageWeeklyHours ?? ''}
              onChange={e => {
                const input = e.target.value;
                const parsed = input === '' ? null : Number(input);
                formikProps.setFieldValue('AverageWeeklyHours', parsed);
              }}
              onBlur={handleBlur}
              error={
                touched.AverageWeeklyHours && Boolean(errors.AverageWeeklyHours)
              }
              helperText={
                touched.AverageWeeklyHours && errors.AverageWeeklyHours
              }
            />
          </Box>
        </Box>
      )}

      <Box sx={{ pb: 2 }}>
        <StyledLabel sx={{ flex: 1 }}>
          Team <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <CustomSelect
          name="Team"
          options={teamListOptions}
          value={values.Team || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          width={'100%'}
          error={touched.Team && Boolean(errors.Team)}
          helperText={formikProps.errors.Team}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel sx={{ flex: 1 }}>
          Manager <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <CustomSelect
          name="Manager"
          options={resourceListOptions}
          value={values.Manager || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          width={'100%'}
          error={touched.Manager && Boolean(errors.Manager)}
          helperText={formikProps.errors.Manager}
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
        <CustomDatePicker
          name="StartDate"
          value={formikProps.values.StartDate || null}
          formikProps={formikProps}
          error={
            formikProps.touched.StartDate &&
            Boolean(formikProps.errors.StartDate)
          }
          helperText={
            formikProps.touched.StartDate && formikProps.errors.StartDate
          }
          label="Start Date"
          placeholder="MM/DD/YYYY"
          title="Start Date"
          isRequired={false}
        />
        <CustomDatePicker
          name="EndDate"
          value={formikProps.values.EndDate || null}
          formikProps={formikProps}
          error={
            formikProps.touched.EndDate && Boolean(formikProps.errors.EndDate)
          }
          helperText={formikProps.touched.EndDate && formikProps.errors.EndDate}
          label="End Date"
          placeholder="MM/DD/YYYY"
          title="End Date"
          isRequired={false}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <StyledLabel>Work Location</StyledLabel>
        <StyledInput
          name="WorkLocation"
          placeholder="Enter location"
          value={values.WorkLocation || ''}
          onChange={handleChange}
          onBlur={e => {
            const trimmedValue = e.target.value.trim();
            setFieldValue('WorkLocation', trimmedValue);
            handleBlur(e);
          }}
          error={touched.WorkLocation && Boolean(errors.WorkLocation)}
          helperText={touched.WorkLocation && errors.WorkLocation}
        />
      </Box>
    </Box>
  );
};

export default AddResourceForm;
