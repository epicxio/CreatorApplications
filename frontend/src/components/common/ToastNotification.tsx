import React, { useEffect } from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Error, Info, Warning, Close } from '@mui/icons-material';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastNotificationProps {
  toast: Toast | null;
  onClose: () => void;
}

const ToastContainer = styled(motion.div)<{ type: ToastType }>(({ type, theme }) => {
  const colors = {
    success: {
      bg: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(56, 142, 60, 0.15) 100%)',
      border: 'rgba(76, 175, 80, 0.3)',
      icon: '#4CAF50',
      glow: 'rgba(76, 175, 80, 0.4)'
    },
    error: {
      bg: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(211, 47, 47, 0.15) 100%)',
      border: 'rgba(244, 67, 54, 0.3)',
      icon: '#F44336',
      glow: 'rgba(244, 67, 54, 0.4)'
    },
    info: {
      bg: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(25, 118, 210, 0.15) 100%)',
      border: 'rgba(33, 150, 243, 0.3)',
      icon: '#2196F3',
      glow: 'rgba(33, 150, 243, 0.4)'
    },
    warning: {
      bg: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(245, 124, 0, 0.15) 100%)',
      border: 'rgba(255, 152, 0, 0.3)',
      icon: '#FF9800',
      glow: 'rgba(255, 152, 0, 0.4)'
    }
  };

  const color = colors[type];

  return {
    position: 'fixed',
    top: 24,
    right: 24,
    zIndex: 10000,
    minWidth: 320,
    maxWidth: 480,
    background: color.bg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: `1px solid ${color.border}`,
    boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 0 20px ${color.glow}`,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: `linear-gradient(90deg, ${color.icon}, transparent)`,
      borderRadius: '16px 16px 0 0'
    }
  };
});

const IconContainer = styled(motion.div)<{ type: ToastType }>(({ type }) => {
  const colors = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warning: '#FF9800'
  };

  return {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors[type]}22, ${colors[type]}11)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `2px solid ${colors[type]}33`,
    color: colors[type]
  };
});

const MessageText = styled(Typography)({
  flex: 1,
  color: '#1a1a1a',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: 1.5
});

const CloseButton = styled(motion.div)({
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#666',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  }
});

const ProgressBar = styled(motion.div)<{ type: ToastType }>(({ type }) => {
  const colors = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warning: '#FF9800'
  };

  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${colors[type]}, ${colors[type]}88)`,
    borderRadius: '0 0 16px 16px',
    transformOrigin: 'left'
  };
});

const iconMap = {
  success: CheckCircle,
  error: Error,
  info: Info,
  warning: Warning
};

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const duration = toast.duration || 4000;
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const IconComponent = iconMap[toast.type];

  return (
    <AnimatePresence>
      {toast && (
        <ToastContainer
          type={toast.type}
          initial={{ opacity: 0, x: 400, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        >
          <IconContainer
            type={toast.type}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1
            }}
          >
            <IconComponent sx={{ fontSize: 24 }} />
          </IconContainer>

          <MessageText>{toast.message}</MessageText>

          <CloseButton
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Close sx={{ fontSize: 18 }} />
          </CloseButton>

          <ProgressBar
            type={toast.type}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{
              duration: (toast.duration || 4000) / 1000,
              ease: 'linear'
            }}
          />
        </ToastContainer>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;

