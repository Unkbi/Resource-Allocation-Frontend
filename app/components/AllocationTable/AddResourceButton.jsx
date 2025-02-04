import { useRef, useState } from "react";
import { Button, styled, Box, Autocomplete, TextField, Popper, Avatar } from "@mui/material";
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
 
const StyledPopper = styled(Popper)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.06)",
  maxHeight: "156px",
  overflow:"auto",
  "&::-webkit-scrollbar": {
    width: "2px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#C4CAD4",
  },
  "& .MuiAutocomplete-noOptions":{
    fontFamily: "'Manrope', serif",
    fontSize: "12px",
  },
  "& .MuiAutocomplete-option":{
    padding:"10px !important",
    border:"none",
    color:"#313F68",
    fontFamily: "'Manrope', serif",
    fontSize: "12px",
    fontWeight: "600",
    alignItems:"flex-start !important"
  },
  "& .userEamil":{
    color:"#313F68",
    fontFamily: "'Manrope', serif",
    fontSize: "10px",
    fontWeight: "500",
    display:"block"
  },
  "& .MuiAvatar-root":{
    width:"16px",
    height:"16px",
    marginRight:"8px",
    marginTop:"2px"
  }
}));
 
const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  }
}));
 
 
 
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
          open={true}
          // onBlur={() => setIsSearchMode(false)}
          popupIcon={null}
          slots={{ popper: StyledPopper }}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <Box
                component="li"
                key={key}
                {...optionProps}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderBottom: `1px solid ${"#eaecef"}`,
                }}
              >
                {/* Avatar */}
                <Avatar
                  src={typeof option.avatar === "string" && option.avatar.startsWith("/") ? option.avatar : undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    marginRight: 2,
                    backgroundColor: "#0366d6",
                  }}
                >
                  {typeof option.avatar === "string" && !option.avatar.startsWith("/") ? option.avatar : ""}
                </Avatar>
                {/* Resource Details */}
                <Box sx={{ flexGrow: 1 }}>
                  <span>{option.name}</span>
                  <span className="userEamil">
                    alex.lewis@stealth.com
                  </span>
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => <StyledInput {...params} inputRef={inputRef} />}
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