import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Badge,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { MoreVert, Edit, Delete } from '@mui/icons-material';

export default function AccessTable({
  title,
  data,
  onAdd,
  onEdit,
  onDelete,
  renderMenu,
  menuId,
  setMenuId,
  setAnchorEl,
  anchorEl,
  buttonLabel = 'Add New',
}: {
  title: string;
  data: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  renderMenu: (id: string) => React.ReactNode;
  menuId: string | null;
  setMenuId: (id: string | null) => void;
  setAnchorEl: (el: HTMLElement | null) => void;
  anchorEl: HTMLElement | null;
  buttonLabel?: string;
}) {
  return (
    <Card
      sx={{ mt: 2, mb: 2, border: 'none', boxShadow: 1, borderRadius: '8px' }}
    >
      <CardHeader
        title={
          <Typography
            variant="h6"
            sx={{ color: '#1F2937', fontWeight: 700, fontSize: '18px' }}
          >
            {title}
          </Typography>
        }
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
            onClick={onAdd}
            sx={{
              display: 'flex',
              height: '40px',
              padding: '9.33px 15.644px 9.34px 16px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '5.8px',
              borderRadius: '8px',
              background: '#152E75',
              color: '#FFF',
              fontFamily: 'Open Sans',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '24px',
              textTransform: 'none',
            }}
          >
            {buttonLabel}
          </Button>
        }
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '88.67px',
          padding: '28px 38px 24px 24px',
          borderBottom: '0.667px solid #E5E7EB',
          backgroundColor: '#fff',
        }}
      />
      <CardContent sx={{ padding: 0, paddingTop: '12px' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f8f9fa' }}>
                <TableCell
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6B7280',
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6B7280',
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6B7280',
                  }}
                >
                  Created Date
                </TableCell>
                <TableCell
                  sx={{
                    px: 3,
                    py: 1.5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6B7280',
                    width: '15%',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(item => (
                <TableRow key={item.id}>
                  <TableCell
                    sx={{
                      px: 3,
                      py: 2,
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#111827',
                    }}
                  >
                    {item.name}
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2 }}>
                    <Badge
                      sx={{
                        background: '#4B9F471A',
                        color: '#4B9F47',
                        px: 1.5,
                        py: 0.5,
                        fontWeight: 400,
                        fontSize: 12,
                      }}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2, color: '#6c757d' }}>
                    {item.createdDate}
                  </TableCell>
                  <TableCell sx={{ px: 3, py: 2 }}>
                    <IconButton
                      onClick={e => {
                        setAnchorEl(e.currentTarget);
                        setMenuId(item.id);
                      }}
                      size="small"
                    >
                      <MoreVert sx={{ fontSize: 20 }} />
                    </IconButton>
                    {renderMenu(item.id)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
