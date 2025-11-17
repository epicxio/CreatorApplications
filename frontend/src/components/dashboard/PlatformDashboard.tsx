import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
  Avatar,
  AvatarGroup,
  Badge,
  Chip,
} from '@mui/material';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import {
  People,
  Business,
  SupervisorAccount,
  CheckCircle,
  TrendingUp,
  MoreVert,
  NotificationsActive,
  Speed,
  EmojiEvents,
  Inventory,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Types
interface NeoChipProps {
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface ProgressBarProps {
  value?: number;
  color?: string;
}

interface AvatarBadgeProps {
  color?: string;
}

// Styled Components
const NeoCard = styled(m.div)(({ theme }) => ({
  background: 'rgba(20, 20, 35, 0.6)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: theme.spacing(3),
  position: 'relative',
  height: '100%',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    zIndex: 1,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover:after': {
    opacity: 1,
  },
  transform: 'perspective(1000px) rotateX(0deg)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'perspective(1000px) rotateX(5deg)',
  },
}));

const StatsValue = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 800,
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
  letterSpacing: '-0.02em',
}));

const NeoChip = styled(Chip)<NeoChipProps>(({ theme, color = 'primary' }) => ({
  background: alpha(theme.palette[color].main, 0.15),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
  color: theme.palette[color].main,
  '& .MuiChip-label': {
    textShadow: `0 0 10px ${alpha(theme.palette[color].main, 0.4)}`,
  },
}));

const StyledProgressBar = styled(Box)<ProgressBarProps>(({ value = 0, color = '#6366f1' }) => ({
  height: '4px',
  width: '100%',
  background: 'rgba(255,255,255,0.1)',
  borderRadius: '2px',
  position: 'relative',
  overflow: 'hidden',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${value}%`,
    background: `linear-gradient(90deg, ${color}, ${color}88)`,
    boxShadow: `0 0 10px ${color}`,
    borderRadius: '2px',
  },
}));

const AvatarBadge = styled(Avatar)<AvatarBadgeProps>(({ theme, color = '#6366f1' }) => ({
  background: `linear-gradient(135deg, ${color}, ${color}88)`,
  border: '2px solid rgba(255,255,255,0.1)',
  boxShadow: `0 0 15px ${color}44`,
  '&:hover': {
    transform: 'scale(1.1)',
    transition: 'transform 0.2s ease',
  },
}));

const PlatformDashboard: React.FC = () => {
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    {
      title: 'Creators',
      value: '120',
      icon: <People />,
      activeCount: '85',
      activeLabel: 'Active',
      color: '#6366f1',
      progress: 85,
    },
    {
      title: 'Brands',
      value: '40',
      icon: <Business />,
      activeCount: '32',
      activeLabel: 'Active',
      color: '#ec4899',
      progress: 80,
    },
    {
      title: 'Account Managers',
      value: '15',
      icon: <SupervisorAccount />,
      activeCount: '12',
      activeLabel: 'Active',
      linkedCount: '60',
      linkedLabel: 'Linked',
      color: '#14b8a6',
      progress: 80,
    },
    {
      title: 'Invites Pending',
      value: '7',
      icon: <Speed />,
      activeLabel: 'Creators',
      color: '#f97316',
      progress: 70,
    },
  ];

  const highlights = [
    {
      title: 'Deals Closed',
      value: '54',
      icon: <CheckCircle />,
      color: '#22c55e',
    },
    {
      title: 'Top Creator',
      value: 'Cathy Creator',
      subtext: 'Deals: 24',
      icon: <EmojiEvents />,
      color: '#8b5cf6',
      avatar: 'C',
    },
    {
      title: 'Most Products',
      value: 'BrandX',
      subtext: 'Products: 18',
      icon: <Inventory />,
      color: '#f43f5e',
      avatar: 'B',
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          p: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
          <Typography
            variant="h4"
            component={m.h4}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 4,
              fontSize: { xs: '1.5rem', md: '2rem' },
              textShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            Platform Dashboard
          </Typography>

          {isLoaded && (
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={stat.title}>
                  <NeoCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '12px',
                            background: alpha(stat.color, 0.15),
                            color: stat.color,
                            display: 'flex',
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {stat.title}
                        </Typography>
                      </Box>
                      
                      <StatsValue sx={{ mb: 2 }}>{stat.value}</StatsValue>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {stat.activeCount && (
                          <NeoChip
                            label={`${stat.activeLabel}: ${stat.activeCount}`}
                            color="success"
                            size="small"
                          />
                        )}
                        {stat.linkedCount && (
                          <NeoChip
                            label={`${stat.linkedLabel}: ${stat.linkedCount}`}
                            color="info"
                            size="small"
                          />
                        )}
                      </Box>
                      
                      <StyledProgressBar value={stat.progress} color={stat.color} />
                    </Box>
                  </NeoCard>
                </Grid>
              ))}

              {highlights.map((highlight, index) => (
                <Grid item xs={12} sm={6} md={4} key={highlight.title}>
                  <NeoCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 4) * 0.1 }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {highlight.avatar ? (
                          <AvatarBadge color={highlight.color}>{highlight.avatar}</AvatarBadge>
                        ) : (
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: '12px',
                              background: alpha(highlight.color, 0.15),
                              color: highlight.color,
                              display: 'flex',
                            }}
                          >
                            {highlight.icon}
                          </Box>
                        )}
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {highlight.title}
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                            {highlight.value}
                          </Typography>
                          {highlight.subtext && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              {highlight.subtext}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </NeoCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </LazyMotion>
  );
};

export default PlatformDashboard; 