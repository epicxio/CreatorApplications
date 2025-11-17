import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Avatar,
  IconButton,
  styled,
  Box,
  Tabs,
  Tab,
  Button,
  Typography
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const importAll = (r: { keys: () => string[]; (key: string): string }): string[] => r.keys().map(r);

const beautifulAvatars = importAll(require.context('../../assets/images/avatars/beautiful', false, /\.(svg)$/));
const animalAvatars = importAll(require.context('../../assets/images/avatars/animals', false, /\.(svg)$/));
const cartoonAvatars = importAll(require.context('../../assets/images/avatars/cartoons', false, /\.(svg)$/));
const genZCartoonsAvatars = importAll(require.context('../../assets/images/avatars/genz', false, /\.(svg)$/));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
  },
}));

const AvatarContainer = styled(Box)`
  cursor: pointer;
  border-radius: 50%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(108, 99, 255, 0.7);
  }
`;

interface AvatarSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectAvatar: (url: string) => void;
  initialTab?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`avatar-tabpanel-${index}`}
      aria-labelledby={`avatar-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}


export const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ open, onClose, onSelectAvatar, initialTab = 0 }) => {
  const [selectedTab, setSelectedTab] = useState(initialTab);

  React.useEffect(() => {
    if (open) {
      setSelectedTab(initialTab);
    }
  }, [open, initialTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  const handleSelect = (url: string) => {
    onSelectAvatar(url);
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target && typeof e.target.result === 'string') {
                onSelectAvatar(e.target.result);
                onClose();
            }
        };
        reader.readAsDataURL(event.target.files[0]);
    }
  };

  const renderAvatarGrid = (avatars: string[]) => (
    <Grid container spacing={2}>
      {avatars.map((avatarUrl) => (
        <Grid item xs={3} sm={2} key={avatarUrl}>
          <AvatarContainer onClick={() => handleSelect(avatarUrl)}>
            <Avatar src={avatarUrl} sx={{ width: '100%', height: 'auto', aspectRatio: '1 / 1' }} />
          </AvatarContainer>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Choose an Avatar
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p:0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={handleTabChange} centered variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': { backgroundColor: '#6C63FF' },
                '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .Mui-selected': { color: '#fff' }
              }}
            >
                <Tab label="Beautiful" />
                <Tab label="Animals" />
                <Tab label="Cartoons" />
                <Tab label="Gen Z" />
                <Tab label="Upload" />
            </Tabs>
        </Box>
        <TabPanel value={selectedTab} index={0}>
            {renderAvatarGrid(beautifulAvatars)}
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
            {renderAvatarGrid(animalAvatars)}
        </TabPanel>
        <TabPanel value={selectedTab} index={2}>
            {renderAvatarGrid(cartoonAvatars)}
        </TabPanel>
        <TabPanel value={selectedTab} index={3}>
            {renderAvatarGrid(genZCartoonsAvatars)}
        </TabPanel>
        <TabPanel value={selectedTab} index={4}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload-file"
                    type="file"
                    onChange={handleFileSelect}
                />
                <label htmlFor="avatar-upload-file">
                    <Button 
                      variant="contained" 
                      component="span" 
                      startIcon={<CloudUploadIcon />}
                      sx={{ background: '#6C63FF', '&:hover': { background: '#5A52D9' } }}
                    >
                        Upload from your device
                    </Button>
                </label>
                <Typography variant="body2" sx={{ mt: 2, opacity: 0.7 }}>
                    Or drag and drop an image here.
                </Typography>
            </Box>
        </TabPanel>
      </DialogContent>
    </StyledDialog>
  );
}; 