'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';

export interface SaveReport {
    Name: string;
    Description?: string;
}

import { FormikProps } from 'formik';
import { StyledCommentInput, StyledInput } from '../Input/StyledInput';
import { RootState } from '@/app/redux/store';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

interface SaveReportsForm {
    formikProps: FormikProps<SaveReport>;
    setFormValue: (value: SaveReport) => void;
    permissions: Record<string, CrudPermissions>;
}

const SaveReportsForm = ({
    formikProps,
    setFormValue = () => { },
    permissions,
}: SaveReportsForm) => {
    const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
        formikProps;
    const { initialData } = useSelector(
        (state: any) => state.globalDialog.formState
    );
    const { formType } = useSelector(
        (state: RootState) => state.globalDialog.formState
    );
    const [readOnly, setReadOnly] = useState(true);

    useEffect(() => {
        // setReadOnly(
        //   (formType === 'save_reports' &&
        //     !permissions['ProjectTypeGroup']?.u) ||
        //     (formType === 'add_project_type_group' &&
        //       !permissions['ProjectTypeGroup']?.c)
        // );
    }, []);

    useEffect(() => {
        if (initialData) {
            const rowData = {
                Name: initialData.Name || '',
                Description: initialData?.Description || '',
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
                    Report Name <span style={{ color: 'red' }}>*</span>
                </StyledLabel>
                <StyledInput
                    //   disabled={readOnly}
                    //   readOnly={readOnly}
                    as={TextField}
                    name="Name"
                    placeholder="Enter Name"
                    fullWidth
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        setFieldValue('Name', e.target.value);
                    }}
                    onBlur={
                        handleBlur as React.FocusEventHandler<
                            HTMLInputElement | HTMLTextAreaElement
                        >
                    }
                    value={values.Name || ''}
                    error={touched.Name && Boolean(errors.Name)}
                    helperText={touched.Name && errors.Name}
                />
            </Box>
            <Box sx={{ pb: 2 }}>
                <StyledLabel>Description</StyledLabel>
                <StyledCommentInput
                    name="Description"
                    placeholder='Enter Description'
                    value={values.Description || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={4}
                />
                {/* <StyledInput
                    as={TextField}
                    name="Description"
                    value={values.Description || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.Description && Boolean(errors.Description)}
                    helperText={touched.Description && formikProps.errors.Description}
                /> */}
            </Box>
        </Box>
    );
};

export default SaveReportsForm;
