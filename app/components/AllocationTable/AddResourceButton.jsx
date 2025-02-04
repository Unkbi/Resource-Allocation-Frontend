import { useRef, useState } from "react";
import { Button, styled, Box, Autocomplete, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.custom.textColor,
  textTransform: "none",
  fontSize:"12px",
  fontFamily: "'Manrope', serif",
  fontWeight: "600",
  "& .MuiSvgIcon-root":{
    fontSize:"16px",
  },
  "&:hover": {
    backgroundColor: "transparent",
  },
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
    <Box sx={{ position: "relative", width: "200px" }}>
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
          sx={{ width: 150 }}
          onBlur={() => setIsSearchMode(false)}
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
    </Box>
  );
};