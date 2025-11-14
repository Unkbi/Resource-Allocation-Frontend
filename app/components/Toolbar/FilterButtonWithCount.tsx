import { Badge } from "@mui/material";
import { GridToolbarFilterButton, useGridApiContext } from "@mui/x-data-grid-premium";
import { useEffect, useState } from "react";


const commonButtonStyles = {
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid rgb(214, 220, 225)',
  borderRadius: '4px',
  height: '32px',
  width: '34px',
  padding: '5px 12px',
  fontSize: '13px',
  color: 'rgb(33, 33, 33)',
  fontFamily: (theme: any) => theme.typography.fontFamily,
  fontWeight: '600',
  textTransform: 'none',
  minWidth: '0px',
};


const FilterButtonWithCount = () => {
  const apiRef = useGridApiContext();
  const [filterCount, setFilterCount] = useState(0);

  useEffect(() => {
    if (!apiRef?.current) return;
    const updateFilterCount = () => {
      const filters = apiRef.current.state.filter.filterModel.items;
      const activeCount = filters.filter(f => !!f.value).length;
      setFilterCount(activeCount);
    };
    updateFilterCount();
    return apiRef.current.subscribeEvent('filterModelChange', updateFilterCount);
  }, [apiRef]);

  return (
    <Badge
      badgeContent={filterCount > 0 ? filterCount : 0}
      color="primary"
      sx={{
        '& .MuiBadge-badge': {
          top: '-6px',
          right: '-6px',
          backgroundColor: '#1C2D5F',
          fontSize: '10px',
          height: '16px',
          minWidth: '16px',
        },
      }}
    >
      <GridToolbarFilterButton
        slotProps={{
          tooltip: { title: 'Filter' },
          button: {
            variant: 'outlined',
            startIcon: (
              <img
                src="/images/icons/newFilterPeople.svg"
                alt="filter"
                style={{ marginLeft: '8px' }}
              />
            ),
            className: 'columns-button',
            sx: commonButtonStyles,
          },
        }}
      />
    </Badge>
  );
};

export default FilterButtonWithCount;