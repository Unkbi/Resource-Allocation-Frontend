import { Project } from '@/app/types';
import { getProjectBudgetCategoryDisplayName } from '@/app/utils/common';
import { Box, Typography } from '@mui/material';

interface ProjectTotalCustomToolTipProps {
  params: any;
  projectCategory: string;
  projectBudgetColor: string;
  formattedValue: string;
  project: Project | undefined;
}

const ProjectTotalCustomToolTip = ({
  params,
  projectCategory,
  projectBudgetColor,
  formattedValue,
  project,
}: ProjectTotalCustomToolTipProps) => {
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        padding: 1,
        borderRadius: 1,
        boxShadow: 2,
        color: '#000',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: '#333',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal',
        }}
      >
        {
          // @ts-ignore
          params?.rowNode?.groupingKey
        }
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            height: '12px',
            width: '12px',
            backgroundColor: projectBudgetColor,
            borderRadius: '2px',
            marginTop: '2px',
          }}
        />
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 400 }}>
          {getProjectBudgetCategoryDisplayName(projectCategory)}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: projectBudgetColor,
            }}
          >
            {`${formattedValue}K`}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
            {`/${project?.Budget || 0}K`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectTotalCustomToolTip;
