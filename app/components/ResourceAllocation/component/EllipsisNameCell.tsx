import { useState, useEffect, useRef, ReactNode } from 'react';
import { Tooltip } from '@mui/material';
import { CustomAddIcon } from '../../AllocationTable/CustomAddIcon';
import CustomAvatar from '../../Avatar/CustomAvatar';

interface EllipsisNameCellProps {
  value?: string | null;
  resourceCount?: any;
  onAddClick?: () => void;
  showAddIcon?: boolean;
  AddIconComponent?: ReactNode;
  showAvatar?: boolean;
  showAddButton?: boolean;
  isFormatWithK?: boolean;
  leftBorderColor?: string;
  CustomTooptip?: React.ReactElement;
}

const EllipsisNameCell: React.FC<EllipsisNameCellProps> = ({
  value,
  resourceCount,
  onAddClick,
  showAddIcon = false,
  AddIconComponent,
  showAvatar = false,
  showAddButton = true,
  leftBorderColor = '',
  isFormatWithK,
  CustomTooptip,
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const checkOverflow = () => {
      const el = textRef.current;
      if (el) {
        setIsOverflowing(el.scrollWidth > el.clientWidth);
      }
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    if (textRef.current?.parentElement) {
      observer.observe(textRef.current.parentElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [value]);

  const safeValue = value ?? 'N/A';

  const content = (
    <div
      ref={textRef}
      style={{
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
      }}
    >
      {safeValue}
    </div>
  );

  return (
    <>
      {leftBorderColor && (
        <div
          style={{
            position: 'relative',
            height: '52px',
            width: '7px',
            backgroundColor: leftBorderColor,
            left: '-38px',
          }}
        ></div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflow: 'hidden',
          minWidth: 0,
          width: '100%',
        }}
      >
        {showAvatar && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CustomAvatar value={value || ''} showFullName={false} />
          </div>
        )}

        {CustomTooptip ? (
          <Tooltip
            title={CustomTooptip}
            placement="right"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: '#fff',
                  color: '#000',
                  boxShadow: 2,
                  border: '1px solid #ddd',
                  padding: 0,
                },
              },
              arrow: {
                sx: {
                  color: '#fff',
                },
              },
            }}
          >
            {content}
          </Tooltip>
        ) : isOverflowing ? (
          <Tooltip title={value} placement="right" arrow>
            {content}
          </Tooltip>
        ) : (
          content
        )}

        {showAddIcon &&
          (AddIconComponent ? (
            AddIconComponent
          ) : (
            <div style={{ flexShrink: 0, marginLeft: '2px' }}>
              <CustomAddIcon
                count={resourceCount}
                onClick={onAddClick}
                showAddButton={showAddButton}
                isFormatWithK={isFormatWithK}
              />
            </div>
          ))}
      </div>
    </>
  );
};

export default EllipsisNameCell;
