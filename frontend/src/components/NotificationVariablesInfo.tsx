import React, { useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';

interface Variable {
  variable: string;
  description: string;
}

export const NotificationVariablesInfo: React.FC<{ variables: Variable[] }> = ({ variables }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Show available template variables">
        <IconButton size="small" onClick={() => setOpen(true)}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Available Template Variables</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Variable</b></TableCell>
                <TableCell><b>Description</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variables.map(v => (
                <TableRow key={v.variable}>
                  <TableCell>{`{{${v.variable}}}`}</TableCell>
                  <TableCell>{v.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  );
}; 