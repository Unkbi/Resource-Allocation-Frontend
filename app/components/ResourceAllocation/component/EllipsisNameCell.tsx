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
}

const EllipsisNameCell: React.FC<EllipsisNameCellProps> = ({
  value,
  resourceCount,
  onAddClick,
  showAddIcon = false,
  AddIconComponent,
  showAvatar = false,
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

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
    <span
      ref={textRef}
      style={{
        display: 'inline-block',
        width: '150%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {safeValue}
    </span>
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap:'4px',
        overflow: 'hidden',
        minWidth: 0,
        width: '100%',
      }}
    >
      {showAvatar && (
         <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <CustomAvatar value={value} showFullName={false}  />
        </div>
      )}

      {isOverflowing ? (
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
          <CustomAddIcon count={resourceCount} onClick={onAddClick} />
        ))}
    </div>
  );
};

export default EllipsisNameCell;
