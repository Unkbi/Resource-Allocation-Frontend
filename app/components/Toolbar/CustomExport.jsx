import React, { memo } from 'react'
import { download, mkConfig } from "export-to-csv";
import { GridExcelExportMenuItem, GridToolbarExportContainer, useGridApiContext } from '@mui/x-data-grid-premium';
import { MenuItem, styled } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

const GridToolbarExport = () => {
  const view = useSelector(state => state.allocationView.view);
  const apiRef = useGridApiContext();
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');

  const csvConfig = mkConfig({ useKeysAsHeaders: true,
     filename: `${view === 'Projects' ? 'Allocation_Projects' : 'Allocation_Teams'}_${currentDate}`
    });

  const excelPostProcess = (wb) => {
    const ws = wb.worksheet;
    const rows = ws.getRows(1, ws.rowCount);
    let team = '';
    rows.forEach((row) => {
      if (row.getCell(1).value) {
        team = row.getCell(1).value;
      }
      if (team) {
        row.getCell(1).value = team;
      }
    });
    for (let i = 1; i <= ws.rowCount; i++) {
      if (ws.getRow(i).getCell(2).value === '' || ws.getRow(i).getCell(2).value === null) {
        ws.spliceRows(i, 1);
        i--;
      }
    }
    return wb;
  }

  const getRowsWithoutGroups = () => {
    let csv_data_array = apiRef.current.getDataAsCsv()?.split('\n');
    if (!csv_data_array) return '';
    let team = '';
    csv_data_array?.forEach((row, index) => {
      if (index < 2) return;
      let row_array = row?.split(',');
      if (row_array?.[0] && !row_array?.[1]) team = row_array?.[0];
      else row_array[0] = team;
      csv_data_array[index] = row_array?.join(',');
    });
    csv_data_array = csv_data_array?.filter((row, index) => index < 1 || row.split(',')[1] !== '');
    let new_csv_data = csv_data_array?.join('\n');
    return new_csv_data;
  };

  const handleExport = () => {
    download(csvConfig)(getRowsWithoutGroups());
  }

  const CustomCsvMenuItem = styled(MenuItem)(() => ({
    justifyContent: 'flex-start',
    textTransform: 'none',
    color: 'rgba(0, 0, 0, 0.87)',
    width: '100%',
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  }));

  const CsvExportMenuItem = ({ hideMenu, ...props }) => {
    return (
      <CustomCsvMenuItem {...props} onClick={handleExport}>
        Download as CSV
      </CustomCsvMenuItem>
    )
  }

  return (
    <GridToolbarExportContainer>
      <GridExcelExportMenuItem options={{ exceljsPostProcess: excelPostProcess,
        fileName: `${view === 'Projects' ? 'Allocation_Projects' : 'Allocation_Teams'}_${currentDate}`
        }} />
      <CsvExportMenuItem />
    </GridToolbarExportContainer>
  );
}

export default memo(GridToolbarExport);