import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  styled,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, Camera as CameraIcon } from '@mui/icons-material';

const StyledDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
    },
});

const VideoContainer = styled(Box)({
    position: 'relative',
    width: '100%',
    backgroundColor: '#000',
});

const CaptureButton = styled(Button)({
    background: '#6C63FF',
    color: 'white',
    '&:hover': {
        background: '#5A52D9',
    },
});

interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (_imageSrc: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ open, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (open) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          setStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          alert('Could not access the camera. Please check your browser permissions.');
          onClose();
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose/stream intentionally excluded
  }, [open]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/png');
        onCapture(imageSrc);
        onClose();
      }
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Capture Photo
        <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
            <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <VideoContainer>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px' }} />
        </VideoContainer>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
        <CaptureButton onClick={handleCapture} startIcon={<CameraIcon />}>
          Capture
        </CaptureButton>
      </DialogActions>
    </StyledDialog>
  );
}; 