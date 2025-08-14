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
  Link,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import StyledLabel from '../Label/StyledLabel';
import { StyledFormHelperText, StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import { useDispatch } from 'react-redux';
import { FETCH_ORGANISATIONS } from '@/app/redux/actions/organizationsAction';
import {
  fetchResourceAllocationsForSaga,
  fetchTeamAllocationsForSaga,
  getResourceDetail,
} from '@/app/services/teamServices';
import dayjs from 'dayjs';
import { getMondayOfISO, getOnlyFilterSettings } from '@/app/utils/common';
import { compressToEncodedURIComponent } from 'lz-string';
import { DATE_FORMAT } from '@/app/constants/constants';
import {
  fetchResourceAllocations,
  getMaxAllocationDate,
  getResourceAllocationsForPeriod,
  getResourceIdByEmail,
} from '@/app/utils/allocationUtils';
import { addDays, addWeeks, format } from 'date-fns';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import { parseISO } from 'date-fns';
import StyledAutocomplete from '../Select/Autocomplete';

const warningTextStyle = {
  color: '#B44536',
  fontFamily: 'Open Sans',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '21px',
  mt: 0.5,
};

const reviewLinkStyle = {
  mt: '2px',
  display: 'inline-block',
  color: '#2563EB',
  textAlign: 'center',
  fontFamily: 'Open Sans',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '24px',
  textDecorationLine: 'underline',
};

const AddResourceForm = ({ formikProps, setFormValue, onValuesChange }) => {
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
  const { formType } = useSelector(state => state.globalDialog.formState);
  const [showWarning, setShowWarning] = useState(false);
  const [shareLink, setShareLink] = useState('');

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
    teams?.map(team => ({
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

      const matchedTeam = teams?.find(team => team.Name === initialData.Team);
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
        ConfirmTransfer: initialData.ConfirmTransfer || true,
        shouldTransfer: initialData.shouldTransfer || false,
      };

      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});

      // Notify parent of initial values
      if (onValuesChange) {
        onValuesChange({
          teamId: matchedTeam?.Id,
          organisationId: matchedOrg?.Id,
          teamName: matchedTeam?.Name,
          organisationName: matchedOrg?.Name,
        });
      }
    };

    loadAndSetForm();
  }, [initialData?.Id, organisations, teams]);

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

  // Add effect to watch Team and Organisation changes
  useEffect(() => {
    if (onValuesChange && values.Team && values.Organisation) {
      onValuesChange({
        teamId: values.Team,
        organisationId: values.Organisation,
        teamName: teamListOptions.find(t => t.value === values.Team)?.label,
        organisationName: organisationListOptions.find(
          o => o.value === values.Organisation
        )?.label,
      });
    }
  }, [values.Team, values.Organisation]);

  const handleEndDateChange = async newDate => {
    const formattedEndDate = newDate?.format(DATE_FORMAT.toUpperCase());
    formikProps.setFieldValue('EndDate', formattedEndDate);
    if (formType !== 'edit_resource') return;
    try {
      const resourceId = getResourceIdByEmail(resources.result, values.Email);
      if (!resourceId) {
        console.error('Resource ID not found for email:', values.Email);
        return;
      }

      const allocations = await getResourceAllocationsForPeriod(
        resourceId,
        formattedEndDate
      );
      const hasFutureAllocations = allocations.some(allocation =>
        dayjs(allocation.Period).isAfter(newDate, 'day')
      );
      if (hasFutureAllocations) {
        formikProps.setFieldValue('ConfirmTransfer', false);
        formikProps.setFieldValue('shouldTransfer', true);
        setShowWarning(true);
      } else {
        formikProps.setFieldValue('ConfirmTransfer', true);
        formikProps.setFieldValue('shouldTransfer', false);
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  const handleShareDeepLink = async () => {
    const resourceFullName = `${formikProps.values.FullName}`.trim();
    const formattedEndDate = dayjs(formikProps.values.EndDate).format(
      'YYYY-MM-DD'
    );
    const resourceId = getResourceIdByEmail(resources.result, values.Email);
    if (!resourceId) {
      console.error('Resource ID not found for email:', values.Email);
      return;
    }
    const allocations = await getResourceAllocationsForPeriod(
      resourceId,
      formattedEndDate
    );
    const resourceAllocations = allocations.filter(
      alloc => alloc.Resource === resourceId
    );
    const actualMaxDate = getMaxAllocationDate(resourceAllocations, resourceId);

    const fallbackDate = dayjs(addWeeks(new Date(formattedEndDate), 51)).format(
      'YYYY-MM-DD'
    );
    const maxDate =
      actualMaxDate && dayjs(actualMaxDate).isBefore(dayjs(fallbackDate))
        ? actualMaxDate
        : fallbackDate;

    const reviewLink = compressToEncodedURIComponent(
      JSON.stringify(
        getOnlyFilterSettings({
          GroupBy: 'Teams',
          StartDate: format(
            addDays(parseISO(getMondayOfISO(formikProps.values.EndDate)), 7),
            DATE_FORMAT
          ),
          EndDate: maxDate,
          ColumnsVisible: [
            '__row_group_by_columns_group_teams__',
            '__row_group_by_columns_group_resource__',
            'project',
            'resourceType',
          ],
          isFixedRange: true,
          isDynamicRange: false,
          Filters: [
            {
              field: '__row_group_by_columns_group_resource__',
              operator: 'equals',
              value: resourceFullName,
            },
          ],
        })
      )
    );

    const link = `${window.location.origin}/allocation?settings=${reviewLink}`;
    setShareLink(link);
    window.open(link, '_blank');
  };

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
          <StyledAutocomplete
            name="Organisation"
            label="Organization"
            placeholder="Enter organization"
            value={values.Organisation || ''}
            options={organisationListOptions}
            formikProps={formikProps}
            fullWidth
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
          <StyledAutocomplete
            name="Type"
            label="Type"
            placeholder="Select type"
            value={values.Type || ''}
            options={typeOptions}
            formikProps={formikProps}
            fullWidth
            onChange={(event, newValue) => {
              if (
                newValue !== 'Contractor - FT' &&
                newValue !== 'Contractor - PT'
              ) {
                formikProps.setFieldValue('ContractorHourlyRate', null);
                formikProps.setFieldValue('AverageWeeklyHours', null);
              }
            }}
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
        <StyledAutocomplete
          name="Team"
          label="Team"
          placeholder="Select team"
          options={teamListOptions}
          value={values.Team || ''}
          formikProps={formikProps}
          fullWidth
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel sx={{ flex: 1 }}>Manager</StyledLabel>
        <StyledAutocomplete
          name="Manager"
          label="Manager"
          placeholder="Select manager"
          options={resourceListOptions}
          value={values.Manager || ''}
          formikProps={formikProps}
          fullWidth
        />
      </Box>

      <Box
        sx={{
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
          onChange={handleEndDateChange}
          formikProps={formikProps}
          error={
            formikProps.touched.EndDate && Boolean(formikProps.errors.EndDate)
          }
          helperText={
            formikProps.touched.EndDate && formikProps.errors.EndDate
              ? formikProps.errors.EndDate
              : ''
          }
          label="End Date"
          placeholder="MM/DD/YYYY"
          title="End Date"
          isRequired={false}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        {showWarning && (
          <>
            <Typography sx={warningTextStyle}>
              This resource has existing allocations beyond the date range.
            </Typography>
            <Link
              href="#"
              underline="always"
              sx={reviewLinkStyle}
              onClick={handleShareDeepLink}
            >
              CLICK HERE to review allocations
            </Link>
          </>
        )}
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
      <Box>
        {showWarning && (
          <Box sx={{ width: '329px', mt: 2 }}>
            <Typography
              sx={{
                color: '#374151',
                fontFamily: 'Open Sans',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '24px',
                mb: 1,
              }}
            ></Typography>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                sx={{
                  alignItems: 'flex-start',
                }}
                control={
                  <Checkbox
                    checked={values.ConfirmTransfer || false}
                    onChange={e =>
                      formikProps.setFieldValue(
                        'ConfirmTransfer',
                        e.target.checked
                      )
                    }
                    error={
                      formikProps.touched.ConfirmTransfer &&
                      formikProps.errors.ConfirmTransfer
                    }
                    onBlur={formikProps.handleBlur}
                    name="ConfirmTransfer"
                    sx={{
                      mt: '3px',
                      color: formikProps.errors.ConfirmTransfer
                        ? '#B44536'
                        : undefined,
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      color: '#374151',
                      fontFamily: 'Open Sans',
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '24px',
                      whiteSpace: 'normal',
                      overflowWrap: 'break-word',
                    }}
                  >
                    Allocations beyond date range will be transferred to the
                    Allocation Manager. Are you sure you want to continue?
                  </Typography>
                }
              />
              {formikProps.touched.ConfirmTransfer &&
                formikProps.errors.ConfirmTransfer && (
                  <StyledFormHelperText
                    sx={{
                      marginLeft: '36px',
                      mt: 0.5,
                    }}
                    error
                  >
                    {formikProps.errors.ConfirmTransfer}
                  </StyledFormHelperText>
                )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AddResourceForm;
