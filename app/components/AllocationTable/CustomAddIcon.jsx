import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';

export const CustomAddIcon = ({
  value,
  count = null,  
  onClick=()=>{}
}) => {

  return (
    <Box
    sx={{
      display: 'flex',
      width: '100%',
      minWidth: 0,
      alignItems: 'center',
      '&:hover .add-icon': {
        opacity: 1,
        visibility: 'visible'
      }
    }}
  >
   {value &&<Box sx={{
      flex: '1 1 auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}>
      { value}
    </Box>}
    <Box sx={{
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    }}>
      {count !== null && count !== "" && (
          <Box component="span">
            ({count})
          </Box>
        )}
      <AddIcon className="add-icon"
        sx={{
          fontSize:20,
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s, visibility 0.2s',
          backgroundColor: '#1C2D5F',
          color: '#fff',
          cursor: 'pointer',
          ml: count === null  ? 1 : 0,
          '&:hover': {
            backgroundColor: '#1C2D5F',
          },
          borderRadius: '2px',
        }}
      onClick={onClick} />
    </Box>
  </Box>
    
  );
};

