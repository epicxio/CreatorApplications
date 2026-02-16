import React from 'react';
import { Dialog, Box, Typography, Button, IconButton, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { WarningAmberRounded, CheckCircleOutlineRounded, ErrorOutlineRounded, Close, InfoOutlined } from '@mui/icons-material';

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
    transition: {
      duration: 0.3,
    },
  },
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .MuiPaper-root': {
    background: `linear-gradient(135deg, rgba(30, 30, 30, 0.4), rgba(0, 0, 0, 0.2))`,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    color: '#fff',
    padding: theme.spacing(3),
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
    position: 'relative',
  },
}));

const IconWrapper = styled(Box)<{ iconcolor: string }>(({ iconcolor }) => ({
  fontSize: '4.5rem',
  lineHeight: 1,
  marginBottom: '1rem',
  color: iconcolor,
  display: 'flex',
  justifyContent: 'center',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1.5),
  right: theme.spacing(1.5),
  color: 'rgba(255, 255, 255, 0.7)',
  transition: 'transform 0.2s, color 0.2s',
  '&:hover': {
    color: '#fff',
    transform: 'rotate(90deg)',
  },
}));

const ActionButton = styled(Button)<{ buttoncolor: string }>(({ theme, buttoncolor }) => ({
  marginTop: theme.spacing(2.5),
  borderRadius: '12px',
  padding: '12px 30px',
  fontWeight: 'bold',
  fontSize: '1rem',
  color: '#fff',
  background: buttoncolor,
  border: 'none',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 20px ${buttoncolor}`,
  },
}));

export type NotificationType = 'warning' | 'success' | 'error' | 'info';

const typeConfig = {
  warning: {
    icon: <WarningAmberRounded fontSize="inherit" />,
    color: '#FFC107',
    buttonColor: 'linear-gradient(45deg, #FFC107 30%, #FF9800 90%)',
  },
  success: {
    icon: <CheckCircleOutlineRounded fontSize="inherit" />,
    color: '#4CAF50',
    buttonColor: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
  },
  error: {
    icon: <ErrorOutlineRounded fontSize="inherit" />,
    color: '#F44336',
    buttonColor: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
  },
  info: {
    icon: <InfoOutlined fontSize="inherit" />,
    color: '#2196F3',
    buttonColor: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
  }
};

interface FuturisticNotificationProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: NotificationType;
}

export const FuturisticNotification: React.FC<FuturisticNotificationProps> = ({
  open,
  onClose,
  title,
  message,
  type,
}) => {
  const config = typeConfig[type];

  return (
    <>
      {open && (
        <StyledDialog open={open} onClose={onClose} fullWidth>
          <motion.div 
            variants={modalVariants} 
            initial="hidden" 
            animate="visible" 
            exit="exit"
          >
            <CloseButton onClick={onClose}>
              <Close />
            </CloseButton>
            <IconWrapper iconcolor={config.color}>
              {config.icon}
            </IconWrapper>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              {message}
            </Typography>
            <ActionButton onClick={onClose} buttoncolor={config.buttonColor}>
              DISMISS
            </ActionButton>
          </motion.div>
        </StyledDialog>
      )}
    </>
  );
}; 