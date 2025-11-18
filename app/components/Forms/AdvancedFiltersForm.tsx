'use client';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { FormikProps } from 'formik';
import { RootState, AppDispatch } from '@/app/redux/store';
import { CrudPermissions } from '../HOC/withRBAC';
import StyledAutocomplete from '../Select/Autocomplete';
import { ProjectTypeGroup } from '@/app/types';
import { FETCH_PROJECT_TYPE_GROUPS, FETCH_PROJECT_TYPES } from '@/app/redux/actions/allSettingsActions';
import { fetchAllTeams } from '@/app/redux/actions/fetchTeamsAction';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { FETCH_PORTFOLIOS } from '@/app/redux/actions/portfolioActions';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { FETCH_ORGANISATIONS } from '@/app/redux/actions/organizationsAction';
import { getAllocationManagerFromPath, getResourceFromUid } from '@/app/utils/common';

interface FormValues {
    ProjectTypeGroup: string;
    ProjectType: string;
    Team: string | string[];
    Resource: string;
    AllocationManager: string;
    ProjectManager: string;
    Project: string | string[];
    Portfolio: string;
    Organization: string;
    [key: string]: any;
}

interface AddLocationFormProps {
    formikProps: FormikProps<FormValues>;
    setFormValue: (value: any) => void;
    permissions: Record<string, CrudPermissions>;
}

const AdvancedFiltersForm = ({
    formikProps,
    setFormValue,
    permissions,
}: AddLocationFormProps) => {
    const { values, handleChange, handleBlur, setFieldValue, touched, errors } = formikProps;

    const dispatch = useDispatch<AppDispatch>();
    const { projectTypeGroups, projectTypes } = useSelector((state: RootState) => state.allSettings);
    const { portfolios } = useSelector((state: RootState) => state.portfolios);
    const { teams } = useSelector((state: RootState) => state.teams);
    const { resources } = useSelector((state: RootState) => state.resources);
    const { organisations } = useSelector((state: RootState) => state.organisations);
    const { projects } = useSelector((state: RootState) => state.projects);
    const [projectTypeGroupName, setProjectTypeGroupName] = useState<
        ProjectTypeGroup[]
    >([]);
    const { initialData, formType } = useSelector(
        (state: RootState) => state.globalDialog.formState
    );


    useEffect(() => {
        // Fetch any required data here if needed
        if (projectTypeGroups.length === 0) {
            dispatch({ type: FETCH_PROJECT_TYPE_GROUPS });
        }
        if (!teams?.length) {
            dispatch(fetchAllTeams());
        }
        if (!projects?.length) {
            dispatch(fetchAllProjects());
        }
        if (!resources?.length) {
            dispatch({
                type: FETCH_ALL_RESOURCES_DETAIL,
                payload: {},
            });
        }
        if (!portfolios?.length) {
            dispatch({
                type: FETCH_PORTFOLIOS,
                payload: {},
            });
        }
        if (!organisations?.length) {
            dispatch({
                type: FETCH_ORGANISATIONS,
                payload: {},
            });
        }
        if (projectTypes.length === 0) {
            dispatch({ type: FETCH_PROJECT_TYPES });
        }

    }, []);

    useEffect(() => {
        setProjectTypeGroupName(projectTypeGroups || []);

        if (initialData) {
            const rowData = {
                ProjectTypeGroup: initialData.ProjectTypeGroup || '',
                ProjectType: initialData.ProjectType || '',
                Team: Array.isArray(initialData.Team) ? initialData.Team : (initialData.Team ? [initialData.Team] : []),
                Resource: initialData.Resource || '',
                AllocationManager: initialData.AllocationManager || '',
                ProjectManager: initialData.ProjectManager || '',
                Project: Array.isArray(initialData.Project) ? initialData.Project : (initialData.Project ? [initialData.Project] : []),
                Portfolio: initialData.Portfolio || '',
                Organization: initialData.Organization || '',
            };
            setFormValue(rowData);
            formikProps.resetForm({ values: rowData });
            formikProps.setTouched({});
        }
    }, [projectTypeGroups, initialData]);


    const projectTypeGroupNameOptions =
        projectTypeGroupName?.map((projectTypeGroup: ProjectTypeGroup) => ({
            value: projectTypeGroup.Id,
            label: projectTypeGroup.Name ?? '',
        })) || [];

    const projectTypeOptions =
        projectTypes?.map((projectType: any) => ({
            value: projectType.Id,
            label: projectType.Name ?? '',
        })) || [];

    const teamOptions =
        teams?.map((team: any) => ({
            value: team.Id,
            label: team.Name ?? '',
        })) || [];

    const resourceOptions =
        resources?.map((resource: any) => ({
            value: resource.Id,
            label: resource.FullName ?? '',
        })) || [];
    const portfolioOptions =
        portfolios?.map((portfolio: any) => ({
            value: portfolio.Id,
            label: portfolio.Name ?? '',
        })) || [];

    const organizationOptions =
        organisations?.map((organisation: any) => ({
            value: organisation.Id,
            label: organisation.Name ?? '',
        })) || [];

    const projectOptions =
        projects?.map((project: any) => ({
            value: project.Id,
            label: project.Name ?? '',
        })) || [];

    const allocationManagers = teams?.map((team: any) => {
        const manager = team && getAllocationManagerFromPath(team.AllocationManager, resources);
        return {
            value: manager ? manager.Id : '',
            label: manager ? manager.FullName : '',
        };
    }) || [];

    const allocationManagerOptions = Array.from(
        new Map(
            allocationManagers
                .filter(option => option.value !== '')
                .map(option => [option.value, option])
        ).values()
    );

    const projectManagers = projects?.map((project: any) => {
        const manager = project && getResourceFromUid(project.ProjectManager, resources);
        return {
            value: manager ? manager.Id : '',
            label: manager ? manager.FullName : '',
        };
    }) || [];

    const projectManagerOptions = Array.from(
        new Map(
            projectManagers
                .filter(option => option.value !== '')
                .map(option => [option.value, option])
        ).values()
    );

    return (
        <Box>
            <Box sx={{ pb: 1 }}>
                <StyledLabel>Project Type Group</StyledLabel>
                <StyledAutocomplete
                    name="ProjectTypeGroup"
                    label="Select Project Type Group"
                    multiple={true}
                    options={projectTypeGroupNameOptions}
                    value={values.ProjectTypeGroup || []}
                    formikProps={formikProps}
                />
            </Box>

            <Box sx={{ pb: 1}}>
                <StyledLabel>Project Type</StyledLabel>
                <StyledAutocomplete
                    name="ProjectType"
                    label="Project Type"
                    multiple={true}
                    options={projectTypeOptions}
                    value={values.ProjectType || []}
                    formikProps={formikProps}
                />
            </Box>
            <Box sx={{ pb: 1 }}>
                <StyledLabel>Project Manager</StyledLabel>
                <StyledAutocomplete
                    name="ProjectManager"
                    label="Project Manager"
                    multiple={true}
                    options={projectManagerOptions}
                    value={values.ProjectManager || []}
                    formikProps={formikProps}
                />
            </Box>
            <Box sx={{ pb: 1}}>
                <StyledLabel>Project</StyledLabel>
                <StyledAutocomplete
                    name="Project"
                    label="Project"
                    multiple={true}
                    options={projectOptions}
                    value={values.Project || []}
                    formikProps={formikProps}
                />
            </Box>
            <Box sx={{ pb: 1, borderBottom: '1px solid #00000040', mb: 1 }}>
                <StyledLabel>Portfolio</StyledLabel>
                <StyledAutocomplete
                    name="Portfolio"
                    label="Portfolio"
                    multiple={true}
                    options={portfolioOptions}
                    value={values.Portfolio || []}
                    formikProps={formikProps}
                />
            </Box>
            <Box sx={{ pb: 1 }}>
                <StyledLabel>Team</StyledLabel>
                <StyledAutocomplete
                    name="Team"
                    label="Team"
                    multiple={true}
                    options={teamOptions}
                    value={values.Team || []}
                    formikProps={formikProps}
                />
            </Box>
            <Box sx={{ pb: 1 }}>
                <StyledLabel>Resource</StyledLabel>
                <StyledAutocomplete
                    name="Resource"
                    label="Resource"
                    multiple={true}
                    options={resourceOptions}
                    value={values.Resource || []}
                    formikProps={formikProps}
                />
            </Box>
            <Box sx={{ pb: 1, borderBottom: '1px solid #00000040', mb: 1 }}>
                <StyledLabel>Allocation Manager</StyledLabel>
                <StyledAutocomplete
                    name="AllocationManager"
                    label="Allocation Manager"
                    multiple={true}
                    options={allocationManagerOptions}
                    value={values.AllocationManager || []}
                    formikProps={formikProps}
                />
            </Box>
            <Box sx={{ pb: 1 }}>
                <StyledLabel>Organization</StyledLabel>
                <StyledAutocomplete
                    name="Organization"
                    label="Organization"
                    multiple={true}
                    options={organizationOptions}
                    value={values.Organization || []}
                    formikProps={formikProps}
                />
            </Box>
        </Box>
    );
};

export default AdvancedFiltersForm;
