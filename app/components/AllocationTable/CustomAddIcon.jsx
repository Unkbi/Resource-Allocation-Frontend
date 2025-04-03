import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';

export const CustomAddIcon = ({
  value,
  count = null,
  onClick = () => {},
  menu = null,
  columnType = "teams",
}) => {
  const isResourceColumn = columnType === "resource";
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minWidth: 0,
        position: 'relative',
        overflow: 'visible',

        '&:hover .icon-overlay': {
          opacity: 1,
          visibility: 'visible',
        },
        '&:hover .count': {
          opacity: 0,
          visibility: 'hidden',
        },
        '&:hover .text': {
          paddingRight: menu ? '70px' : count !== null ? '38px' : '0px',
        },
      }}
    >
      <Box
        className="text"
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingRight:
            !isResourceColumn && count !== null ? '38px' : '0px',
          transition: 'padding-right 0.2s',
        }}
      >
        {value}
      </Box>
      <Box
        className="icon-overlay"
        sx={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: menu ? 0.25 : 0,
          mr: menu ? '-10px' : 0,
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s, visibility 0.2s',
          zIndex: 2,
          overflow: 'visible',
        }}
      >
        <AddIcon
          onClick={onClick}
          sx={{
            width: 26,
            height: 26,
            fontSize: 20,
            backgroundColor: '#1C2D5F',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#1C2D5F',
            },
          }}
        />
        {menu}
      </Box>

      {count !== null && count !== '' && (
        <Box
          className="count"
          sx={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '26px',
            height: '26px',
            fontSize: '12px',
            fontWeight: 500,
            borderRadius: '4px',
            background: '#7881A5',
            color: '#F1F1F1',
            transition: 'opacity 0.2s',
            zIndex: 1,
          }}
        >
          ({count})
        </Box>
      )}
    </Box>
  );
};