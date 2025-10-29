import React from 'react';
import { Menu, MenuItem } from '@mui/material';

export interface ContextMenuData {
  mouseX: number;
  mouseY: number;
  value?: string | number | null;
  row?: Record<string, any>;
  field?: string;
}

interface ContextMenuProps {
  contextMenu: ContextMenuData | null;
  handleClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ contextMenu, handleClose }) => {
  if (!contextMenu) return null;

  const { mouseX, mouseY, value, row, field } = contextMenu;

  return (
    <Menu
      open={!!contextMenu}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: mouseY, left: mouseX }}
    >
      <MenuItem
        onClick={() => {
          console.log('Copied value:', value);
          handleClose();
        }}
      >
        Copy
      </MenuItem>

      <MenuItem
        onClick={() => {
          console.log('Row data:', row);
          handleClose();
        }}
      >
        Print Row
      </MenuItem>

      <MenuItem
        onClick={() => {
          console.log('Field:', field);
          handleClose();
        }}
      >
        Highlight
      </MenuItem>

      <MenuItem
        onClick={() => {
          console.log('Email value:', value);
          handleClose();
        }}
      >
        Email
      </MenuItem>
    </Menu>
  );
};

export default ContextMenu;
