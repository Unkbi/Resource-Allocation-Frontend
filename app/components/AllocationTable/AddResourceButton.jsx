import { useRef, useState } from "react";
import { Button, styled, Box, Autocomplete, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.custom.textColor,
  textTransform: "none",
  fontSize:"12px",
  fontFamily: "'Manrope', serif",
  fontWeight: "600",
  padding:"0 16px",
  "& .MuiSvgIcon-root":{
    fontSize:"16px",
  },
  "&:hover": {
    backgroundColor: "transparent",
  },
  "& .MuiTouchRipple-root":{
    display:"none"
  }
}))

const MainBox = styled(Box)(({ theme }) => ({
  position: "relative", 
  width: "auto", 
  margin: "0 -16px",
  "& .MuiInputBase-formControl":{
    padding:"0 !important"
  },
  "& .MuiOutlinedInput-input": {
      height: "51px",
      lineHeight: "32px",
      background: "rgba(157, 201, 255, 0.3)",
      padding: "10px 16px !important",
      borderRadius: "0",
      fontFamily: "'Manrope', serif",
      fontSize: "12px",
      fontWeight: "600",
      color: "#313F68",
      boxSizing: "border-box",
      border: "1px solid #298AFF",
      "&::placeholder": {
          color: "#424242",
          opacity: 1,
          fontFamily: "'Manrope', serif",
          fontSize: "12px",
          fontWeight: "600"
      },
  },
  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      border: "none",
      borderRadius: "0",
      padding:"0"
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: "none",
      borderRadius: "0px"
  }
}))



const allResources = [
  { name: "John Doe", projects: ["Project A"], totalHours: 30 },
  { name: "Jane Smith", projects: ["Project B"], totalHours: 25 },
  { name: "Alice Johnson", projects: ["Project C"], totalHours: 35 },
];

export const AddResourceButton = ({ project, resources, handleAddRow,onClick }) => {
  const [isSearchMode, setIsSearchMode] = useState(false);

  const defaultProps = {
    options: allResources,
    getOptionLabel: (option) => option.name,
  };
  const inputRef = useRef(null);
  const handleButtonClick = () => {
    setIsSearchMode(!isSearchMode)
    onClick()
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  return (
    <MainBox>
      {isSearchMode ? (
          <Autocomplete
          {...defaultProps}
           id="open-on-focus"
           onChange={(event, newValue) => {
            if (newValue) {
              handleAddRow(event, newValue);
            }
            setIsSearchMode(false);
          }}
          //onBlur={() => setIsSearchMode(false)}
          open={true}
          popupIcon={null}
          renderInput={(params) => <TextField {...params} inputRef={inputRef}/>}
        />
      ) : (
        <StyledButton
          variant="text"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleButtonClick}
        >
          Add Resource
        </StyledButton>
      )}
    </MainBox>
  );
};