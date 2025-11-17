import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Divider, Typography, styled } from '@mui/material';

const SubMenuContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: '48px',
}));

const MenuTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginRight: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const MenuButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: theme.spacing(0.5, 1),
  minWidth: 'auto',
  color: theme.palette.text.primary,
  '&.active': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },
}));

interface SubMenuItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  resource: string;
}

interface TopSubMenuProps {
  activeMenu: {
    title: string;
    icon?: React.ReactNode;
    children?: SubMenuItem[];
  } | null;
}

const TopSubMenu: React.FC<TopSubMenuProps> = ({ activeMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!activeMenu || !activeMenu.children?.length) {
    return null;
  }

  return (
    <SubMenuContainer>
      <MenuTitle variant="subtitle1">
        {activeMenu.icon}
        {activeMenu.title}
      </MenuTitle>
      <Divider orientation="vertical" flexItem sx={{ mr: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {activeMenu.children.map((item) => (
          <MenuButton
            key={item.path}
            startIcon={item.icon}
            onClick={() => navigate(item.path)}
            className={location.pathname.startsWith(item.path) ? 'active' : ''}
          >
            {item.title}
          </MenuButton>
        ))}
      </Box>
    </SubMenuContainer>
  );
};

export default TopSubMenu; 