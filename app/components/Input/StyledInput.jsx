import { FormHelperText, styled, TextField, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { TextFieldProps } from '@mui/material/TextField';

export const BaseStyledInput = styled(TextField)(
  ({ readOnly, theme, width, margin, padding, height, error }) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      height: height || '36px',
      backgroundColor: '#FFF',
      fontSize: '12px',
      '& fieldset': {
        borderColor: '#D6DCE1',
      },
      '&.Mui-disabled': {
        backgroundColor: readOnly
          ? theme.palette.readonly.main
          : '#E5E7EB !important',
        '& .MuiInputBase-input': {
          borderColor: readOnly
            ? 'rgba(214, 220, 225, 1) !important'
            : '#D6DCE1 !important',
          color: readOnly
            ? theme.palette.readonly.contrastText
            : 'currentColor !important',
          WebkitTextFillColor: readOnly
            ? theme.palette.readonly.contrastText
            : 'currentColor !important',
        },
      },
    },
    '& .MuiInputBase-adornedStart': {
      color: readOnly
        ? theme.palette.readonly?.contrastText
        : 'currentColor !important',
    },
    '& fieldset': {
      borderColor: error ? theme.palette.error.main : '#D6DCE1',
    },
    '&.bold-input .MuiInputBase-input': {
      fontWeight: 'bold',
      fontSize: '16px',
    },
    '&:hover fieldset': {
      borderColor: error ? theme.palette.error.main : '#D6DCE1',
    },
    '&.Mui-focused fieldset': {
      borderColor: error ? theme.palette.error.main : '#D6DCE1',
    },
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '& input[type="number"]': {
      MozAppearance: 'textfield',
    },
    '& .MuiFormHelperText-root': {
      margin: '4px 0 0 0',
      fontSize: '0.75rem',
      lineHeight: '12px',
      color: error ? theme.palette.error.main : '#6A7178',
      '&.Mui-error': {
        color: theme.palette.error.main,
      },
    },
    width: width || '100%',
    margin: margin || '0',
    padding: padding || '0',
  })
);

export const StyledCommentInput = styled(TextField)(
  ({ theme, width, margin, padding, height }) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      height: height || '88px',
      fill: '#FDFDFD',
      strokeWidth: ' 1px',
      stroke: '#D6DCE1',
      boxshadow: ' 0px 2px 4px 0px #EBEBEB inset',
      backgroundColor: '#FFFFFFF',
      fontSize: '12px',
      '& fieldset': {
        borderColor: '#D6DCE1',
      },
    },
    '& .Mui-disabled': {
      backgroundColor: theme.palette.readonly.main, // This is a custom color in the theme
      cursor: 'default',
    },
    '& .Mui-disabled .MuiInputBase-input': {
      color: '#6B7280 !important',
      WebkitTextFillColor: theme.palette.readonly.contrastText, // This is a custom color in the theme
    },

    width: width || '100%',
    margin: margin || '0',
    padding: padding || '0',
  })
);

export const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: 0,
  fontSize: '0.75rem',
}));

export const StyledFormInfoText = styled(({ children, ...props }) => (
  <Box sx={{ display: 'flex', gap: 0, lineHeight: 1 }}>
    <InfoOutlinedIcon
      sx={{
        fontSize: '0.75rem',
        color: '#757575',
        display: 'flex',
        marginRight: '2px',
      }}
    />
    <FormHelperText
      sx={{
        display: 'inline-flex',
        margin: '0 !important',
        lineHeight: '1 !important',
        padding: 0,
      }}
      {...props}
    >
      {children}
    </FormHelperText>
  </Box>
))(({ theme }) => ({
  color: '#757575',
  marginLeft: 0,
  fontSize: '0.75rem',
  display: 'inline-flex',
  alignItems: 'center',
  '& .MuiFormHelperText-root': {
    margin: 0,
    display: 'inline',
  },
}));

export const StyledInput = props => {
  const { disabled, value, placeholder, ...rest } = props;

  const effectivePlaceholder = disabled && !value ? '' : placeholder;

  return (
    <BaseStyledInput
      {...rest}
      disabled={disabled}
      value={value}
      placeholder={effectivePlaceholder}
    />
  );
};
