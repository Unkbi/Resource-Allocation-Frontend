export const actualsTableStyles = {
  '& .MuiDataGrid-columnHeaders': {
    borderBottom: ' #EEEEEE',
    backgroundColor: '#EEEEEE',
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: '#EEEEEE',
    backgroundColor: '#EEEEEE',
  },
  '& .MuiDataGrid-cell': {
    borderRight: '1px solid #EEEEEE',
    backgroundColor: 'white',
  },
  '.col-cell-actuals, .col-cell-planned': {
    padding: 0,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    color: '#1C2D5F',
    textAlign: 'center',
    fontFamily: '"Open Sans", sans-serif',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 'normal',
  },
  '& .second-total-row  .MuiDataGrid-cell': {
    fontWeight: '700',
    background: ' #E0E0E0',
    position: 'sticky',
    top: 40,
    zIndex: 10,
  },
  '& .first-header-row': {
    backgroundColor: '#EEEEEE',
  },
  '& .col-cell-project': {
    backgroundColor: '#F7FBFF',
    color: '#313F68',
  },
  '& .col-cell-planned': {
    backgroundColor: '#FAFAFA',
    color: '#323232',
  },
  '& .header-project': {
    height: '38px !important',
  },
  '& .header-planned': {
    height: '38px !important',
  },
  '& .header-actuals': {
    height: '38px !important',
  },
  '& .header-comments': {
    height: '38px !important',
  },
  "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button":
    {
      display: 'none',
    },
  '.divider-row': {
    height: '2px !important',
    minHeight: '2px !important',
    maxHeight: '2px !important',
    '& .MuiDataGrid-cell': {
      padding: 0,
      border: 'none',
      backgroundColor: '#C4CAD4',
      height: '2px',
      minHeight: '2px',
      maxHeight: '2px',
    },
  },
  '& .MuiDataGrid-virtualScrollerContent': {
    flexBasis: '0 !important',
    flexGrow: 1,
  },
  '& .last-row': {
    marginBottom: '0',
    paddingBottom: '0',
  },
  '.comment-error-cell .MuiDataGrid-cell:focus-within': {
    outline: 'none !important',
    boxShadow: 'none !important',
  }
};
