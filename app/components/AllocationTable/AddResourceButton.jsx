import { Button, styled } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"

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

export const AddResourceButton = ({ project, onClick }) => (
  <StyledButton variant="text" size="small" startIcon={<AddIcon />} onClick={onClick}>
    Add Resource
  </StyledButton>
)

