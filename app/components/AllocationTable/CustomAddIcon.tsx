import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';
import { Tooltip } from '@mui/material';

interface CustomAddIconProps {
  value?: string | React.ReactNode | null;
  count?: number | null;
  onClick?: () => void;
  menu?: React.ReactNode | null;
  columnType?: 'teams' | 'resource';
}

export const CustomAddIcon = ({
  value = null,
  count = null,
  onClick = () => {},
  menu = null,
  columnType = 'teams',
}: CustomAddIconProps) => {
  const isResourceColumn = columnType === 'resource';
  return (
    <Tooltip
      title={typeof value === 'string' ? value : ''}
      arrow
      placement="right"
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10],
              },
            },
          ],
        },
      }}
    >
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
            paddingRight: menu ? '40px' : count !== null ? '35px' : '0px',
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
            paddingRight: !isResourceColumn && count !== null ? '35px' : '0px',
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
            gap: 0,
            mr: menu ? '-17px' : 0,
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
              width: 22,
              height: 22,
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

        {count !== null && (
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
              width: '22px',
              height: '22px',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '4px',
              background: '#7881A5',
              color: '#F1F1F1',
              transition: 'opacity 0.2s',
              zIndex: 1,
            }}
          >
            {count}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};
