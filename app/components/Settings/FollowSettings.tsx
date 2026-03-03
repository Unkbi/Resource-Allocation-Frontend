'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Popper,
    TextField,
    Chip,
    Divider,
    ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/redux/store';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { fetchFollows } from '@/app/redux/actions/followActions';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { getAllTeams } from '@/app/services/teamServices';
import { getLoginUserDetails } from '@/app/utils/authUtils';
import LoadingScreen from '../Loading/loadingScreen';

interface FollowSettingsProps { }

const sharedFontStyles = {
    fontFamily: 'Open Sans',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 'normal',
};

const chipLabelStyles = {
    color: '#1C2D5F',
    fontWeight: 600,
    lineHeight: '34px',
    backgroundColor: '#fff',
    border: '1px solid #1C2D5F',
    '& .MuiChip-deleteIcon': {
        color: '#1C2D5F',
    },
};

const scrollStyles = {
    maxHeight: 160,
    overflowY: 'auto',
    mb: 1,
    pr: 1,
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#C4CAD4',
        borderRadius: '4px',
        border: '2px solid transparent',
        backgroundClip: 'content-box',
        minHeight: '30px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#A8B0BA',
    },
};

const textFieldStyles = {
    '& .MuiInputBase-input': {
        ...sharedFontStyles,
        color: '#000',
        textAlign: 'left',
    },
    '& .MuiInputBase-input::placeholder': {
        ...sharedFontStyles,
        color: '#757575',
        textAlign: 'left',
    },
};

const FollowSettings: React.FC<FollowSettingsProps> = () => {
    const dispatch: AppDispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.user);
    const userId = getLoginUserDetails(user)?.id;
    const { follows, followsByObjectId, loading } = useSelector(
        (state: RootState) => state.follows
    );
    const { projectTypes } = useSelector((state: RootState) => state.allSettings);
    const { projects } = useSelector((state: RootState) => state.projects);
    const { teams } = useSelector((state: RootState) => state.teams);
    const [loadingTeams, setLoadingTeams] = useState(false);

    // Project dropdown state
    const [projectAnchorEl, setProjectAnchorEl] = useState<null | HTMLElement>(null);
    const [projectSearchText, setProjectSearchText] = useState('');
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

    // Team dropdown state
    const [teamAnchorEl, setTeamAnchorEl] = useState<null | HTMLElement>(null);
    const [teamSearchText, setTeamSearchText] = useState('');
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

    const projectMenuRef = useRef<HTMLDivElement>(null);
    const teamMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchFollows(userId));
        dispatch(fetchAllProjects());
    }, []);

    // Filter followed projects and teams
    const followedProjects = follows.filter((f: any) => f.ObjectType === 'PROJECT');
    const followedTeams = follows.filter((f: any) => f.ObjectType === 'TEAM');

    // Get unfollowed projects and teams for dropdown
    const followedProjectIds = followedProjects.map((f: any) => f.ObjectId);
    const followedTeamIds = followedTeams.map((f: any) => f.ObjectId);

    const unfollowedProjects = (projects?.filter(
        (p: any) => !followedProjectIds.includes(p.Id) && (p.Status === 'Active' || p.Status === 'Approved')
    ) || []).sort((a: any, b: any) => a.Name?.localeCompare(b.Name));

    const unfollowedTeams = (teams?.filter(
        (t: any) => !followedTeamIds.includes(t.Id) && (t.Status === 'Active')
    ) || []).sort((a: any, b: any) => a.Name?.localeCompare(b.Name));

    // Filter projects based on search
    const filteredProjects = unfollowedProjects.filter((project: any) =>
        project.Name?.toLowerCase().includes(projectSearchText.toLowerCase())
    );

    // Filter teams based on search
    const filteredTeams = unfollowedTeams.filter((team: any) =>
        team.Name?.toLowerCase().includes(teamSearchText.toLowerCase())
    );

    // Handle project dropdown
    const handleProjectClick = (event: React.MouseEvent<HTMLElement>) => {
        setProjectAnchorEl(event.currentTarget);
    };

    const handleProjectClose = () => {
        setProjectAnchorEl(null);
        setProjectSearchText('');
        setSelectedProjects([]);
    };

    const handleProjectSelect = (projectId: string) => {
        if (!selectedProjects.includes(projectId)) {
            setSelectedProjects([...selectedProjects, projectId]);
        }
    };

    const handleProjectChipDelete = (projectId: string) => {
        setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    };

    // Handle team dropdown
    const handleTeamClick = (event: React.MouseEvent<HTMLElement>) => {
        setTeamAnchorEl(event.currentTarget);
    };

    const handleTeamClose = () => {
        setTeamAnchorEl(null);
        setTeamSearchText('');
        setSelectedTeams([]);
    };

    const handleTeamSelect = (teamId: string) => {
        if (!selectedTeams.includes(teamId)) {
            setSelectedTeams([...selectedTeams, teamId]);
        }
    };

    const handleTeamChipDelete = (teamId: string) => {
        setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    };

    // Handle Done button for projects
    const handleProjectDone = async () => {
        if (selectedProjects.length === 0) {
            handleProjectClose();
            return;
        }

        try {
            // Create follows for all selected projects sequentially to avoid race conditions
            for (const projectId of selectedProjects) {
                const followPayload = {
                    ObjectType: 'PROJECT',
                    ObjectId: projectId,
                    User: userId,
                    WeeklySummaryEnabled: true,
                    PlanChangesDailySummary: true,
                    ActualsStatusDailySummary: true,
                };

                await new Promise((resolve, reject) => {
                    dispatch({
                        type: 'CREATE_FOLLOW',
                        payload: {
                            payload: followPayload,
                            resolve,
                            reject,
                        },
                    });
                });
            }

            // Refresh follows list after all creates complete
            dispatch(fetchFollows(userId));

            // Show success message
            dispatch({
                type: 'SHOW_TOAST',
                payload: {
                    open: true,
                    message: `Successfully followed ${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''}`,
                    type: 'success',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                },
            });
        } catch (error) {
            console.error('Failed to follow projects:', error);
            dispatch({
                type: 'SHOW_TOAST',
                payload: {
                    open: true,
                    message: 'Failed to follow some projects',
                    type: 'error',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                },
            });
        }

        setSelectedProjects([]);
        handleProjectClose();
    };

    // Handle Done button for teams
    const handleTeamDone = async () => {
        if (selectedTeams.length === 0) {
            handleTeamClose();
            return;
        }

        try {
            // Create follows for all selected teams sequentially to avoid race conditions
            for (const teamId of selectedTeams) {
                const followPayload = {
                    ObjectType: 'TEAM',
                    ObjectId: teamId,
                    User: userId,
                    WeeklySummaryEnabled: true,
                    PlanChangesDailySummary: false, // Teams don't have plan changes by default
                    ActualsStatusDailySummary: true,
                };

                await new Promise((resolve, reject) => {
                    dispatch({
                        type: 'CREATE_FOLLOW',
                        payload: {
                            payload: followPayload,
                            resolve,
                            reject,
                        },
                    });
                });
            }

            // Refresh follows list after all creates complete
            dispatch(fetchFollows(userId));

            // Show success message
            dispatch({
                type: 'SHOW_TOAST',
                payload: {
                    open: true,
                    message: `Successfully followed ${selectedTeams.length} team${selectedTeams.length > 1 ? 's' : ''}`,
                    type: 'success',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                },
            });
        } catch (error) {
            console.error('Failed to follow teams:', error);
            dispatch({
                type: 'SHOW_TOAST',
                payload: {
                    open: true,
                    message: 'Failed to follow some teams',
                    type: 'error',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                },
            });
        }

        setSelectedTeams([]);
        handleTeamClose();
    };

    // Handle settings icon click
    const handleSettingsClick = (followItem: any) => {

        const objectType = followItem.ObjectType;
        const isProject = objectType === 'PROJECT';

        // Find the project or team details
        let itemDetails: any = {};
        if (isProject) {
            const project = projects?.find((p: any) => p.Id === followItem.ObjectId);
            itemDetails = {
                Id: project?.Id || followItem.ObjectId,
                Name: project?.Name || '',
                Status: project?.Status || '',
                Location: project?.Location || '',
                Type: projectTypes?.find((pt: any) => pt.Id === project?.Type)?.Name || '',
                StartDate: project?.StartDate || '',
                EndDate: project?.EndDate || '',
            };
        } else {
            const team = teams?.find((t: any) => t.Id === followItem.ObjectId);
            itemDetails = {
                Id: team?.Id || followItem.ObjectId,
                Team: team?.Name || '',
                Status: team?.Status || '',
            };
        }

        dispatch(
            openDialog({
                title: `${isProject ? 'Project' : 'Team'} Follow Preferences`,
                formType: isProject ? 'follow_project' : 'follow_team',
                initialData: {
                    ...itemDetails,
                    isFollowing: followItem.IsFollowing ?? true,
                    weeklyAISummary: followItem.WeeklySummaryEnabled ?? true,
                    dailySummary: followItem.PlanChangesDailySummary || followItem.ActualsStatusDailySummary ? true : false,
                    planChanges: followItem.PlanChangesDailySummary ?? (isProject ? true : false),
                    actualsUpdates: followItem.ActualsStatusDailySummary ?? true,
                    existingFollowId: followItem.FollowId || followItem.Id,
                },
                submitButtonText: 'Save Preferences',
                cancelButtonText: 'Cancel',
            })
        );

    };

    // Handle unfollow button click
    const handleUnfollowClick = (followItem: any) => {
        const objectType = followItem.ObjectType;
        const isProject = objectType === 'PROJECT';

        // Find the project or team details
        let itemDetails: any = {};
        if (isProject) {
            const project = projects?.find((p: any) => p.Id === followItem.ObjectId);
            itemDetails = {
                Id: project?.Id || followItem.ObjectId,
                Name: project?.Name || '',
                Status: project?.Status || '',
                Location: project?.Location || '',
                Type: projectTypes?.find((pt: any) => pt.Id === project?.Type)?.Name || '',
                StartDate: project?.StartDate || '',
                EndDate: project?.EndDate || '',
            };
        } else {
            const team = teams?.find((t: any) => t.Id === followItem.ObjectId);
            itemDetails = {
                Id: team?.Id || followItem.ObjectId,
                Team: team?.Name || '',
                Status: team?.Status || '',
            };
        }

        dispatch(
            openDialog({
                title: `${isProject ? 'Project' : 'Team'} Follow Preferences`,
                formType: isProject ? 'follow_project' : 'follow_team',
                initialData: {
                    ...itemDetails,
                    isFollowing: false,
                    weeklyAISummary: followItem.WeeklySummaryEnabled ?? true,
                    dailySummary: followItem.PlanChangesDailySummary || followItem.ActualsStatusDailySummary ? true : false,
                    planChanges: followItem.PlanChangesDailySummary ?? (isProject ? true : false),
                    actualsUpdates: followItem.ActualsStatusDailySummary ?? true,
                    existingFollowId: followItem.FollowId || followItem.Id,
                },
                submitButtonText: 'Save Preferences',
                cancelButtonText: 'Cancel',
            })
        );
    };

    // Count enabled notifications
    const countEnabledNotifications = (followItem: any) => {
        let count = 0;
        if (followItem.WeeklySummaryEnabled) count++;
        if (followItem.PlanChangesDailySummary) count++;
        if (followItem.ActualsStatusDailySummary) count++;
        return count;
    };

    // Get display name for project/team
    const getDisplayName = (followItem: any) => {
        if (followItem.ObjectType === 'PROJECT') {
            const project = projects?.find((p: any) => p.Id === followItem.ObjectId);
            return project?.Name || 'Unknown Project';
        } else {
            const team = teams?.find((t: any) => t.Id === followItem.ObjectId);
            return team?.Name || 'Unknown Team';
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Box sx={{ p: 3 }}>

            {/* Projects Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography
                        sx={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#0A0A0A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                            }}
                        >
                            <img src={'/images/icons/projectFolder.svg'} alt="Projects" style={{ width: 20, height: 20, color: '#4A5565' }} />
                        </Box>
                        Projects ({followedProjects.length})
                    </Typography>
                    <Button
                        variant="text"
                        onClick={handleProjectClick}
                        sx={{
                            color: '#4169E1',
                            fontSize: '14px',
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(65, 105, 225, 0.08)',
                            },
                        }}
                    >
                        + Follow Project
                    </Button>
                </Box>

                {/* Projects List */}
                {followedProjects.length === 0 ? (
                    <Typography sx={{ fontSize: '14px', color: '#999', fontStyle: 'italic', ml: 4 }}>
                        No projects followed yet
                    </Typography>
                ) : (
                    <Box sx={{
                        display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB',
                        borderRadius: '10px',
                    }}>
                        {followedProjects.map((follow: any, i: any) => (
                            <Box
                                key={follow.FollowId || follow.Id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    borderBottom: i !== followedProjects.length - 1 ? '1px solid #E5E7EB' : 'none',
                                    '&:hover': {
                                        backgroundColor: '#F9FAFB',
                                    },
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#0A0A0A',
                                            mb: 0.5,
                                        }}
                                    >
                                        {getDisplayName(follow)}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            color: '#666',
                                        }}
                                    >
                                        {countEnabledNotifications(follow)} of 3 notifications enabled
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleUnfollowClick(follow)}
                                        sx={{
                                            color: '#DC2626',
                                            borderColor: '#DC2626',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            px: 2,
                                            py: 0.5,
                                            '&:hover': {
                                                borderColor: '#B91C1C',
                                                backgroundColor: 'rgba(220, 38, 38, 0.04)',
                                            },
                                        }}
                                    >
                                        Unfollow
                                    </Button>
                                    <IconButton
                                        onClick={() => handleSettingsClick(follow)}
                                        sx={{
                                            color: '#666',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                            },
                                        }}
                                    >
                                        <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Teams Section 
           The teams section is currently commented out, but can be enabled by removing the comment tags and ensuring that the necessary data and handlers are in place.
            */}          
           {/* <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography
                        sx={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#0A0A0A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Box
                            component="span"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                            }}
                        >
                            <img src={'/images/icons/TeamSettingIcon.svg'} alt="Teams" style={{ width: 20, height: 20, color: '#4A5565' }} />
                        </Box>
                        Teams ({followedTeams.length})
                    </Typography>
                    <Button
                        variant="text"
                        onClick={handleTeamClick}
                        sx={{
                            color: '#4169E1',
                            fontSize: '14px',
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(65, 105, 225, 0.08)',
                            },
                        }}
                    >
                        + Follow Team
                    </Button>
                </Box>

               
                {followedTeams.length === 0 ? (
                    <Typography sx={{ fontSize: '14px', color: '#999', fontStyle: 'italic', ml: 4 }}>
                        No teams followed yet
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB',
                                    borderRadius: '8px' }}>
                        {followedTeams.map((follow: any, i:any) => (
                            <Box
                                key={follow.FollowId || follow.Id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    borderBottom: i !== followedTeams.length - 1 ? '1px solid #E5E7EB' : 'none',
                                    '&:hover': {
                                        backgroundColor: '#F9FAFB',
                                    },
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#0A0A0A',
                                            mb: 0.5,
                                        }}
                                    >
                                        {getDisplayName(follow)}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            color: '#666',
                                        }}
                                    >
                                        {countEnabledNotifications(follow)} of 3 notifications enabled
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleUnfollowClick(follow)}
                                        sx={{
                                            color: '#DC2626',
                                            borderColor: '#DC2626',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            px: 2,
                                            py: 0.5,
                                            '&:hover': {
                                                borderColor: '#B91C1C',
                                                backgroundColor: 'rgba(220, 38, 38, 0.04)',
                                            },
                                        }}
                                    >
                                        Unfollow
                                    </Button>
                                    <IconButton
                                        onClick={() => handleSettingsClick(follow)}
                                        sx={{
                                            color: '#666',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                            },
                                        }}
                                    >
                                        <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box> */}

            {/* Project Dropdown Menu */}
            <Popper
                open={Boolean(projectAnchorEl)}
                anchorEl={projectAnchorEl}
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={handleProjectClose}>
                    <Box
                        sx={{
                            minWidth: '410px',
                            maxWidth: '820px',
                            padding: 1,
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            boxShadow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <IconButton
                            onClick={handleProjectClose}
                            sx={{
                                width: 24,
                                height: 24,
                                padding: 0,
                                mb: 1,
                                alignSelf: 'flex-start',
                            }}
                        >
                        <Box
                            component="img"
                            src="/images/icons/back-btn.svg"
                            alt="Back"
                            sx={{ width: 20, height: 20 }}
                        />
                    </IconButton>

                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 0.5,
                            backgroundColor: 'rgba(242, 245, 250, 0.30)',
                            borderRadius: 1,
                            border: '1px solid #D6DCE1',
                            padding: '4px 8px',
                            mb: 1,
                            minHeight: 40,
                        }}
                    >
                        {selectedProjects.map(projectId => {
                            const project = projects?.find((p: any) => p.Id === projectId);
                            return (
                                <Chip
                                    key={projectId}
                                    label={project?.Name || 'Unknown'}
                                    onDelete={() => handleProjectChipDelete(projectId)}
                                    size="small"
                                    sx={{ ...sharedFontStyles, ...chipLabelStyles }}
                                />
                            );
                        })}
                        <TextField
                            variant="standard"
                            placeholder={selectedProjects.length === 0 ? 'Search' : ''}
                            value={projectSearchText}
                            onChange={(e) => setProjectSearchText(e.target.value)}
                            slotProps={{
                                input: {
                                    disableUnderline: true,
                                    endAdornment: (
                                        <SearchIcon sx={{ color: '#344665', fontSize: 18, ml: 1 }} />
                                    ),
                                    sx: textFieldStyles,
                                },
                            }}
                            sx={{
                                flex: 1,
                                minWidth: 20,
                            }}
                        />
                    </Box>

                    <Box sx={scrollStyles}>
                        {filteredProjects.map((project: any) => {
                            const isSelected = selectedProjects.includes(project.Id);
                            return (
                                <Box
                                    key={project.Id}
                                    onClick={() => handleProjectSelect(project.Id)}
                                    sx={{
                                        px: 1,
                                        py: 0.5,
                                        cursor: 'pointer',
                                        backgroundColor: isSelected
                                            ? 'rgba(25, 118, 210, 0.1)'
                                            : 'transparent',
                                        '&:hover': { backgroundColor: '#f0f0f0' },
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            ...sharedFontStyles,
                                            fontSize: '14px',
                                            color: '#424242',
                                            lineHeight: '20px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {project.Name}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box
                        sx={{
                            border: '1px solid #D6DCE1',
                            marginBottom: '1px',
                            lineHeight: '30px',
                        }}
                    />

                    <Button
                        variant="text"
                        onClick={handleProjectDone}
                        sx={{
                            width: 70,
                            height: 36,
                            alignSelf: 'flex-end',
                            marginRight: '10px',
                            textTransform: 'none',
                            color: '#1C2D5F',
                            ...sharedFontStyles,
                            fontWeight: 600,
                            lineHeight: '30px',
                            cursor: 'pointer',
                            justifyContent: 'flex-end',
                            padding: 0,
                            minWidth: 0,
                            backgroundColor: 'transparent',
                            '&:hover': {
                                backgroundColor: 'transparent',
                            },
                        }}
                    >
                        DONE
                    </Button>
                    </Box>
                </ClickAwayListener>
            </Popper>

            {/* Team Dropdown Menu */}
            <Popper
                open={Boolean(teamAnchorEl)}
                anchorEl={teamAnchorEl}
                placement="bottom-start"
                sx={{ zIndex: 1300 }}
            >
                <ClickAwayListener onClickAway={handleTeamClose}>
                    <Box
                        sx={{
                            minWidth: '410px',
                            maxWidth: '820px',
                            padding: 1,
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            boxShadow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <IconButton
                            onClick={handleTeamClose}
                            sx={{
                                width: 24,
                                height: 24,
                                padding: 0,
                                mb: 1,
                                alignSelf: 'flex-start',
                            }}
                        >
                        <Box
                            component="img"
                            src="/images/icons/back-btn.svg"
                            alt="Back"
                            sx={{ width: 20, height: 20 }}
                        />
                    </IconButton>

                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 0.5,
                            backgroundColor: 'rgba(242, 245, 250, 0.30)',
                            borderRadius: 1,
                            border: '1px solid #D6DCE1',
                            padding: '4px 8px',
                            mb: 1,
                            minHeight: 40,
                        }}
                    >
                        {selectedTeams.map(teamId => {
                            const team = teams?.find((t: any) => t.Id === teamId);
                            return (
                                <Chip
                                    key={teamId}
                                    label={team?.Name || 'Unknown'}
                                    onDelete={() => handleTeamChipDelete(teamId)}
                                    size="small"
                                    sx={{ ...sharedFontStyles, ...chipLabelStyles }}
                                />
                            );
                        })}
                        <TextField
                            variant="standard"
                            placeholder={selectedTeams.length === 0 ? 'Search' : ''}
                            value={teamSearchText}
                            onChange={(e) => setTeamSearchText(e.target.value)}
                            slotProps={{
                                input: {
                                    disableUnderline: true,
                                    endAdornment: (
                                        <SearchIcon sx={{ color: '#344665', fontSize: 18, ml: 1 }} />
                                    ),
                                    sx: textFieldStyles,
                                },
                            }}
                            sx={{
                                flex: 1,
                                minWidth: 20,
                            }}
                        />
                    </Box>

                    <Box sx={scrollStyles}>
                        {filteredTeams.map((team: any) => {
                            const isSelected = selectedTeams.includes(team.Id);
                            return (
                                <Box
                                    key={team.Id}
                                    onClick={() => handleTeamSelect(team.Id)}
                                    sx={{
                                        px: 1,
                                        py: 0.5,
                                        cursor: 'pointer',
                                        backgroundColor: isSelected
                                            ? 'rgba(25, 118, 210, 0.1)'
                                            : 'transparent',
                                        '&:hover': { backgroundColor: '#f0f0f0' },
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            ...sharedFontStyles,
                                            fontSize: '14px',
                                            color: '#424242',
                                            lineHeight: '20px',
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {team.Name}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                    <Box
                        sx={{
                            border: '1px solid #D6DCE1',
                            marginBottom: '1px',
                            lineHeight: '30px',
                        }}
                    />

                    <Button
                        variant="text"
                        onClick={handleTeamDone}
                        sx={{
                            width: 70,
                            height: 36,
                            alignSelf: 'flex-end',
                            marginRight: '10px',
                            textTransform: 'none',
                            color: '#1C2D5F',
                            ...sharedFontStyles,
                            fontWeight: 600,
                            lineHeight: '30px',
                            cursor: 'pointer',
                            justifyContent: 'flex-end',
                            padding: 0,
                            minWidth: 0,
                            backgroundColor: 'transparent',
                            '&:hover': {
                                backgroundColor: 'transparent',
                            },
                        }}
                    >
                        DONE
                    </Button>
                    </Box>
                </ClickAwayListener>
            </Popper>
        </Box>
    );
};

export default FollowSettings;
