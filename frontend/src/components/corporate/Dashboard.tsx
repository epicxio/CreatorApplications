import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Avatar, LinearProgress } from '@mui/material';
import { Group as GroupIcon, Business as BusinessIcon, SupervisorAccount as SupervisorAccountIcon, HourglassEmpty as HourglassEmptyIcon, CheckCircle as CheckCircleIcon, EmojiEvents as EmojiEventsIcon, Inventory as InventoryIcon, People as PeopleIcon } from '@mui/icons-material';

// Mock data
const dashboardData = {
  creators: { total: 120, active: 85, pendingInvites: 7, top: { name: 'Cathy Creator', avatar: '', deals: 24 } },
  brands: { total: 40, active: 32, mostProducts: { name: 'BrandX', logo: '', products: 18 }, mostCreators: { name: 'BrandY', logo: '', creators: 12 } },
  accountManagers: { total: 15, active: 12, totalLinked: 60 },
  dealsClosed: 54,
};

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 1, md: 4 }, maxWidth: '1400px', mx: 'auto', width: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
        Platform Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Creators Onboarded/Active */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GroupIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>Creators</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{dashboardData.creators.total}</Typography>
              <Chip label={`Active: ${dashboardData.creators.active}`} color="success" size="small" sx={{ mt: 1 }} />
              <LinearProgress variant="determinate" value={dashboardData.creators.active / dashboardData.creators.total * 100} sx={{ mt: 2, height: 8, borderRadius: 5, bgcolor: 'grey.100' }} color="primary" />
            </CardContent>
          </Card>
        </Grid>
        {/* Brands Onboarded/Active */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>Brands</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{dashboardData.brands.total}</Typography>
              <Chip label={`Active: ${dashboardData.brands.active}`} color="success" size="small" sx={{ mt: 1 }} />
              <LinearProgress variant="determinate" value={dashboardData.brands.active / dashboardData.brands.total * 100} sx={{ mt: 2, height: 8, borderRadius: 5, bgcolor: 'grey.100' }} color="secondary" />
            </CardContent>
          </Card>
        </Grid>
        {/* Account Managers */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SupervisorAccountIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>Account Managers</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{dashboardData.accountManagers.total}</Typography>
              <Chip label={`Active: ${dashboardData.accountManagers.active}`} color="success" size="small" sx={{ mt: 1, mr: 1 }} />
              <Chip label={`Linked: ${dashboardData.accountManagers.totalLinked}`} color="info" size="small" sx={{ mt: 1 }} />
              <LinearProgress variant="determinate" value={dashboardData.accountManagers.active / dashboardData.accountManagers.total * 100} sx={{ mt: 2, height: 8, borderRadius: 5, bgcolor: 'grey.100' }} color="info" />
            </CardContent>
          </Card>
        </Grid>
        {/* Creators Invitation Pending */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>Invites Pending</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{dashboardData.creators.pendingInvites}</Typography>
              <Chip label="Creators" color="warning" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        {/* Deals Closed */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>Deals Closed</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>{dashboardData.dealsClosed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Top Creator */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>Top Creator</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar src={dashboardData.creators.top.avatar} sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {dashboardData.creators.top.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{dashboardData.creators.top.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Deals: {dashboardData.creators.top.deals}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Brand with Most Products */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>Most Products</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar src={dashboardData.brands.mostProducts.logo} sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                  {dashboardData.brands.mostProducts.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{dashboardData.brands.mostProducts.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Products: {dashboardData.brands.mostProducts.products}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Brand with Most Creators */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>Most Creators</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar src={dashboardData.brands.mostCreators.logo} sx={{ mr: 2, bgcolor: 'info.main' }}>
                  {dashboardData.brands.mostCreators.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{dashboardData.brands.mostCreators.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Creators: {dashboardData.brands.mostCreators.creators}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 