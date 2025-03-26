import { styled, TextField } from '@mui/material';

export const StyledInput = styled(TextField)(
  ({ theme, width, margin, padding, height }) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      height: height || '36px',
      backgroundColor: '#FFF',
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
