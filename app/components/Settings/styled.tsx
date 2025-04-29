import {
  Box,
  Button,
  IconButton,
  ListItem,
  ListItemText,
  Paper,
  styled,
  Typography,
  Theme,
  TextField,
} from '@mui/material';
import { DataGridPremium } from '@mui/x-data-grid-premium';

// Interface for props that accept theme
interface ThemeProps {
  theme?: Theme;
}

// Interface for StyledListItem props
interface StyledListItemProps {
  selected?: boolean;
}

const PageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 54px)',
  backgroundColor: '#ffffff',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
});

const Header = styled(Box)({
  height: '64px',
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
  backgroundColor: '#f8f9fa',
});

const BodyContainer = styled(Box)({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
  minHeight: 0,
});

const Sidebar = styled(Box)(({ theme }: ThemeProps) => ({
  width: 200,
  backgroundColor: '#f8f9fa',
  borderRight: '1px solid #e0e0e0',
  overflowY: 'auto',
  '& .MuiListItem-root': {
    padding: '12px 16px',
  },
  '& .MuiListItemIcon-root': {
    minWidth: '40px',
  },
  '& .MuiListItemText-primary': {
    fontSize: '14px',
  },
}));

const ContentContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  // width: 'calc(100% - 212px)',
});

const ContentHeader = styled(Box)({
  padding: '16px 32px',
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: '#ffffff',
});

const ScrollableContent = styled(Box)(({ theme }: ThemeProps) => ({
  flex: 1,
  backgroundColor: '#ffffff',
  overflowY: 'auto',
  minHeight: 0,
}));

const ContentFooter = styled(Box)({
  padding: '16px 32px',
  borderTop: '1px solid #e0e0e0',
  backgroundColor: '#ffffff',
});

const CancelButton = styled(Button)(({ theme }: ThemeProps) => ({
  padding: theme?.spacing(1, 3),
  borderRadius: '4px',
  border: '1px solid #1C2D5F',
  textTransform: 'none',
  '&.MuiButton-outlined': {
    textAlign: 'center',
    fontFamily: 'Open Sans',
    fontSize: '12px',
    fontWeight: 700,
  },
}));

const BottomActions = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
});

const SaveButton = styled(Button)({
  borderRadius: '4px',
  textTransform: 'none',
  '&.MuiButton-contained': {
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Open Sans',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: '#1C2D5F',
    '&:hover': {
      backgroundColor: '#1C2D5F',
    },
    '&.Mui-disabled': {
      backgroundColor: '#D3D3D3',
      color: '#A9A9A9',
      pointerEvents: 'none',
    },
  },
});

const StyledListItem = styled(ListItem, {
  shouldForwardProp: prop => prop !== 'selected',
})<StyledListItemProps>(({ theme, selected }) => ({
  backgroundColor: selected ? '#f1f1f1' : 'transparent',
  borderRadius: '8px',
  width: '180px',
  height: '28px',
  padding: '16px',
  '&:hover': {
    backgroundColor: selected ? '#f1f1f1' : '#f1f1f1',
  },
}));

const SettingsSidebar = styled(Box)({
  width: '212px',
  backgroundColor: '#ffffff',
  overflowY: 'auto',
});

const SectionTitle = styled(Typography)(({ theme }: ThemeProps) => ({
  fontSize: '24px',
  fontWeight: 600,
  color: '#0a1b39',
  marginBottom: theme?.spacing(1),
}));

const SectionDescription = styled(Typography)(({ theme }: ThemeProps) => ({
  fontSize: '14px',
  color: '#6f6f80',
  marginBottom: theme?.spacing(3),
}));

interface ListItemLabel {
  selected?: boolean;
}

const ListItemLabel = styled(ListItemText, {
  shouldForwardProp: prop => prop !== 'selected',
})<StyledListItemProps>(({ theme, selected }) => ({
  '& .MuiListItemText-primary': {
    color: '#484A4A',
    fontWeight: selected ? 600 : 400,
    fontSize: '14px',
  },
}));

const CategoryLabel = styled(Typography)({
  fontSize: '14px',
  fontWeight: 600,
  padding: '16px 16px 8px 16px',
  color: 'rgba(28, 28, 28, 0.40)',
  lineHeight: ' 20px',
});

const MainContent = styled('div')({
  backgroundColor: 'white',
  minHeight: '100vh',
});

const ContentPaper = styled(Paper)({
  backgroundColor: 'white',
  width: ' 80%',
});

const ColorPickerContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
});

const ColorPickerRow = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '8px',
  padding: '12px',
  maxWidth: '480px',
  justifyContent: 'center',
});

interface ColorSwatchProps {
  color: string;
  disabled?: boolean;
}

const ColorSwatch = styled('div')<ColorSwatchProps>(({ color, disabled }) => ({
  width: '40px',
  height: '37px',
  backgroundColor: color,
  borderRadius: '6px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  border: color === '#FFFFFF' ? '1px solid #e0e0e0' : color,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'transform 0.1s ease',
  '&:hover': {
    transform: disabled ? 'none' : 'scale(1.1)',
    boxShadow: disabled ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
  },
}));

interface ColorIndicatorProps {
  color: string;
}

const ColorIndicator = styled('div')<ColorIndicatorProps>(({ color }) => ({
  width: '30px',
  height: '30px',
  backgroundColor: color,
  borderRadius: '4px',
  border: color === '#FFFFFF' ? '1px solid #e0e0e0' : color,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
}));

const RangeInputGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '8px',
  width: '100%',
  height: '90%',
  marginBottom: '4px',
});

const AddButton = styled(Button)({
  display: 'flex',
  alignItems: 'center',
  textTransform: 'none',
  color: '#0D1F52',
  fontSize: '12px',
  fontWeight: 600,
  marginLeft: '40px',
});

export const StyledRangeField = styled(TextField)<{ error?: boolean }>(
  ({ error }) => ({
    width: '48px',
    height: '27px',

    '& .MuiInputBase-root': {
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      borderColor: error ? 'red' : 'inherit',
    },

    '& .Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: 'red !important',
      borderWidth: '2px',
    },

    '& input': {
      color: '#000',
      textAlign: 'center',
      fontFamily: 'Open Sans',
      fontSize: '13px',
      fontStyle: 'normal',
      fontWeight: 600,
      lineHeight: '30px',
    },
  })
);
const StyledDataGrid = styled(DataGridPremium)(({ theme }: ThemeProps) => ({
  borderRadius: '0px',
  borderRight: 'none',
  borderLeft: 'none',
  '& .MuiDataGrid-columnHeaders': {
    '& .MuiDataGrid-columnHeader': {
      borderRight: '1px solid #DDE1E4',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 600,
    },
  },
  '& .MuiDataGrid-cell': {
    borderRight: '1px solid #DDE1E4',
  },
  '& .MuiDataGrid-columnSeparator--resizable': {
    opacity: '0',
  },
  '& .border-header-icon': {
    backgroundImage: `url('/images/icons/Border.svg')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    paddingLeft: '30px',
  },
}));

const CustomFooter = styled('div')({
  borderTop: '1px solid #DDE1E4',
  borderRight: '1px solid #DDE1E4',
  width: '100%',
  padding: '10px 0',
  display: 'flex',
  alignItems: 'center',
});

const DeleteButton = styled(IconButton)({
  color: '#000000',
  padding: '4px',
});

const StyledTableHeader = styled(Typography)({
  color: '#4A4A54',
  fontFamily: 'Open Sans',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: '600',
  lineHeight: '20px',
  padding: '14px',
});

export {
  PageContainer,
  Header,
  BodyContainer,
  Sidebar,
  ContentContainer,
  ContentHeader,
  ScrollableContent,
  ContentFooter,
  CancelButton,
  BottomActions,
  SaveButton,
  StyledListItem,
  SettingsSidebar,
  SectionTitle,
  SectionDescription,
  ListItemLabel,
  CategoryLabel,
  MainContent,
  ContentPaper,
  ColorPickerContainer,
  ColorPickerRow,
  ColorSwatch,
  ColorIndicator,
  RangeInputGroup,
  AddButton,
  StyledDataGrid,
  CustomFooter,
  DeleteButton,
  StyledTableHeader,
};
