import * as Yup from 'yup';


export const addProjectValidationSchema = Yup.object({
    Name: Yup.string().max(90,'Reached Max Characters').required('Project Name is required'),
    Owner: Yup.string().required('Sponsor is required'),
    Manager: Yup.string().required('Manager is required'),
    Location: Yup.string().required('Location is required'),
    Type: Yup.string().required('Project Type is required'),
    // AllowOvertime: Yup.boolean().required('Allow Overtime is required'),
    StartDate: Yup.date().required('Start Date is required'),
    EndDate: Yup.date().required('End Date is required'),
    Status : Yup.string().required('Status is required'),
});

export const addResourceValidationSchema = Yup.object({});

export const addAllocationValidationSchema = Yup.object({});

export const assignAllocationValidationSchema = Yup.object({});
