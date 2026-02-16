import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  styled,
  Box,
  Typography,
  Grid
} from '@mui/material';
import { Close as CloseIcon, PhotoLibrary, CameraAlt, CloudUpload } from '@mui/icons-material';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- theme required by MUI styled API
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
  },
}));

const ChoiceBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, border-color 0.3s ease',
  minHeight: '120px',
  '&:hover': {
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderColor: '#6C63FF',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '2.5rem',
    marginBottom: theme.spacing(1),
    color: '#6C63FF',
  },
}));

interface AvatarChoiceModalProps {
  open: boolean;
  onClose: () => void;
  onChooseLibrary: () => void;
  onTakePhoto: () => void;
  onUpload: () => void;
}

export const AvatarChoiceModal: React.FC<AvatarChoiceModalProps> = ({
  open,
  onClose,
  onChooseLibrary,
  onTakePhoto,
  onUpload,
}) => {
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Profile Picture
        <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
            <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <ChoiceBox onClick={onChooseLibrary}>
              <PhotoLibrary />
              <Typography>Choose from Library</Typography>
            </ChoiceBox>
          </Grid>
          <Grid item xs={12} sm={4}>
            <ChoiceBox onClick={onTakePhoto}>
              <CameraAlt />
              <Typography>Take Photo</Typography>
            </ChoiceBox>
          </Grid>
          <Grid item xs={12} sm={4}>
            <ChoiceBox onClick={onUpload}>
              <CloudUpload />
              <Typography>Upload File</Typography>
            </ChoiceBox>
          </Grid>
        </Grid>
      </DialogContent>
    </StyledDialog>
  );
}; 