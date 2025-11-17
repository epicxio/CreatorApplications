import { Typography, Box, IconButton, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import ProfileMenu from '../layout/ProfileMenu';
import { Menu as MenuIcon } from '@mui/icons-material';

const StyledHeader = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  left: 0,
  height: '64px',
  background: theme.palette.mode === 'dark' 
    ? 'rgba(18, 18, 18, 0.8)'
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer + 2,
  display: 'flex',
  alignItems: 'center',
}));

const StyledToolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: theme.spacing(0, 2),
  minHeight: '64px',
}));

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  return (
    <StyledHeader>
      <StyledToolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              cursor: 'pointer',
              color: theme.palette.primary.main,
              ml: 1,
            }}
            onClick={() => navigate('/')}
          >
            Creator
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated && <ProfileMenu />}
        </Box>
      </StyledToolbar>
    </StyledHeader>
  );
}; 