import { FormHelperText, styled, TextField } from '@mui/material';

export const StyledInput = styled(TextField)(
  ({ theme, width, margin, padding, height , error}) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    height: height || '36px',
    backgroundColor: '#FFF',
    fontSize: '12px',
    "& fieldset":{
      borderColor:"#D6DCE1"
      }
    },
    '& fieldset': {
      borderColor: error ? theme.palette.error.main : '#D6DCE1',
    },
    '&.bold-input .MuiInputBase-input': {
    fontWeight: 'bold',
    fontSize : '16px', 
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
      strokeWidth:" 1px",
      stroke: "#D6DCE1",
      boxshadow:' 0px 2px 4px 0px #EBEBEB inset',
      backgroundColor: '#FFFFFFF',
      fontSize: '12px',
      "& fieldset":{
        borderColor:"#D6DCE1"
      }
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
