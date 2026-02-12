'use client';

import React, { memo } from 'react';
import { MenuItem, styled } from '@mui/material';
import {
  GridExcelExportMenuItem,
  GridToolbarExportContainer,
  useGridApiContext,
} from '@mui/x-data-grid-premium';
import { download, mkConfig } from 'export-to-csv';

const StyledCsvMenuItem = styled(MenuItem)(() => ({
  justifyContent: 'flex-start',
  textTransform: 'none',
  color: 'rgba(0, 0, 0, 0.87)',
  width: '100%',
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

const ReportBuilderExport = () => {
  const apiRef = useGridApiContext();

  const currentDate = new Date()
    .toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');

  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
    filename: `Report_${currentDate}`,
  });

  const handleCsvExport = () => {
    const csv = apiRef.current.getDataAsCsv({
      escapeFormulas: false,
    });
    if (!csv) return;
    download(csvConfig)(csv as any);
  };

  const CsvExportMenuItem = (props: any) => (
    <StyledCsvMenuItem {...props} onClick={handleCsvExport}>
      Download as CSV
    </StyledCsvMenuItem>
  );

  return (
    <GridToolbarExportContainer
      slotProps={{
        button: {
          variant: 'outlined',
          startIcon: (
            <img
              src="/images/icons/DownloadIcon.svg"
              alt="Export"
              style={{ width: 36, height: 40 }}
            />
          ),
          sx: {
            backgroundColor: 'rgba(242, 245, 250, 0.3)',
            border: '1px solid rgb(214, 220, 225)',
            borderRadius: '4px',
            height: '32px',
            width: '36px',
            padding: '5px 12px',
            fontSize: 0,
            color: 'rgb(33, 33, 33)',
            fontWeight: 600,
            textTransform: 'none',
            minWidth: '0px',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '.MuiButton-startIcon': { margin: 0 },
            '&:hover': {
              backgroundColor: 'rgba(242, 245, 250, 0.6)',
            },
          },
        },
      }}
    >
      <GridExcelExportMenuItem
        options={{
          fileName: `Report_${currentDate}`,
        }}
      />
      <CsvExportMenuItem />
    </GridToolbarExportContainer>
  );
};

export default memo(ReportBuilderExport);
