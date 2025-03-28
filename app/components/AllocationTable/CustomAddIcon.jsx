import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';

export const CustomAddIcon = ({
  value,
  count = null,  
  onClick = () => {}
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minWidth: 0,
        alignItems: 'center',
        
        '&:hover .add-icon': {
          display: 'block'
        },
        '&:hover .count': {
          display: 'none'
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
          <>
            <Box 
              className="count"
              component="span"
              sx={{
                display: 'block',
                flex: '0 0 auto',
                display: "flex",
                width: "24px",
                height: "24px",
                padding: "4px 3px",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color:"#F1F1F1",
                fontSize:"12px",
                borderRadius: "4px",
                background:" #7881A5",
              }}
            >
              ({count})
            </Box>
            <AddIcon 
              className="add-icon"
              sx={{
                display: 'none',
                fontSize: 20,
                backgroundColor: '#1C2D5F',
                color: '#fff',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#1C2D5F',
                },
                borderRadius: '2px',
              }}
              onClick={onClick} 
            />
          </>
        )}
      </Box>
    </Box>
  );
};