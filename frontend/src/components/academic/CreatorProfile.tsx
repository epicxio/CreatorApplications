import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Chip, 
  Divider, 
  Tooltip, 
  Tabs, 
  Tab, 
  IconButton,
  LinearProgress,
  CircularProgress,
  Badge,
  Paper,
  styled,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import { 
  Instagram, 
  Facebook, 
  YouTube, 
  Language, 
  LocationOn, 
  Male, 
  Female, 
  EmojiEvents, 
  TrendingUp, 
  BarChart, 
  AccessTime, 
  Tag, 
  Public, 
  Group, 
  InsertChart, 
  Favorite, 
  Comment, 
  Share, 
  Visibility,
  Analytics,
  People,
  ContentPaste,
  Campaign,
  Timeline,
  TrendingDown,
  Speed,
  Psychology,
  Business,
  ShoppingCart,
  LocalOffer,
  Schedule,
  Language as LanguageIcon,
  Flag,
  Cake,
  Work,
  School,
  FitnessCenter,
  Flight,
  AttachMoney,
  FamilyRestroom,
  Category,
  AutoGraph,
  DataUsage,
  Insights,
  Assessment,
  PieChart as PieChartIcon,
  ShowChart,
  BubbleChart,
  ScatterPlot,
  Timeline as TimelineIcon,
  TrendingFlat,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star,
  StarBorder,
  StarHalf,
  CheckCircle,
  Warning,
  Error,
  Info
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ReTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  CartesianGrid
} from 'recharts';
import { useParams } from 'react-router-dom';

// Enhanced mock data with all the analytics features
const creatorData = {
  id: '1',
  name: 'Cathy Creator',
  bio: 'Lifestyle & Travel Influencer. Sharing my adventures and tips for a vibrant life!',
  avatar: '',
  email: 'cathy@creator.com',
  phone: '+91 98765 43210',
  website: 'www.cathycreator.com',
  
  // A. Influencer Profile
  profile: {
    username: '@cathycreator',
    followers: 120000,
    following: 850,
    mediaCount: 1247,
    verified: true,
    joinedDate: '2020-03-15',
    categories: ['Fashion', 'Travel', 'Lifestyle'],
    subcategories: ['Streetwear', 'International', 'Wellness']
  },

  // B. Categories & Subcategories
  categories: {
    primary: 'Fashion',
    secondary: ['Travel', 'Lifestyle'],
    subcategories: {
      'Fashion': ['Streetwear', 'Luxury', 'Casual'],
      'Travel': ['International', 'Adventure', 'Local'],
      'Lifestyle': ['Wellness', 'Food', 'Fitness']
    },
    confidence: 95
  },

  // C. Location-Based Influence
  location: {
    primary: 'Mumbai, India',
    audience: [
      { city: 'Mumbai', percent: 35, engagement: 4.8 },
      { city: 'Delhi', percent: 22, engagement: 4.2 },
      { city: 'Bangalore', percent: 18, engagement: 4.5 },
      { city: 'Chennai', percent: 12, engagement: 3.9 },
      { city: 'Other', percent: 13, engagement: 3.2 }
    ],
    countries: [
      { country: 'India', percent: 70 },
      { country: 'USA', percent: 15 },
      { country: 'UK', percent: 8 },
      { country: 'Canada', percent: 4 },
      { country: 'Other', percent: 3 }
    ]
  },

  // D. Products They Can Promote
  promotableProducts: [
    { category: 'Fashion', products: ['Sneakers', 'Dresses', 'Accessories'], confidence: 92 },
    { category: 'Beauty', products: ['Skincare', 'Makeup', 'Haircare'], confidence: 88 },
    { category: 'Tech', products: ['Smartphones', 'Laptops', 'Gadgets'], confidence: 75 },
    { category: 'Food', products: ['Restaurants', 'Cooking', 'Delivery'], confidence: 82 },
    { category: 'Travel', products: ['Hotels', 'Flights', 'Experiences'], confidence: 95 }
  ],

  // E. Audience Gender Split
  audienceGender: [
    { gender: 'Female', percent: 65, color: '#FF69B4' },
    { gender: 'Male', percent: 35, color: '#4169E1' }
  ],

  // F. Audience Age Bracket
  audienceAge: [
    { age: '13-17', percent: 8, engagement: 3.2 },
    { age: '18-24', percent: 35, engagement: 4.8 },
    { age: '25-34', percent: 42, engagement: 4.5 },
    { age: '35-44', percent: 12, engagement: 3.8 },
    { age: '45+', percent: 3, engagement: 2.9 }
  ],

  // G. Best Posting Times
  bestTimes: [
    { day: 'Monday', hour: '18:00', engagement: 4.8, posts: 12 },
    { day: 'Tuesday', hour: '19:00', engagement: 5.2, posts: 15 },
    { day: 'Wednesday', hour: '20:00', engagement: 4.9, posts: 18 },
    { day: 'Thursday', hour: '18:30', engagement: 5.1, posts: 14 },
    { day: 'Friday', hour: '19:30', engagement: 5.5, posts: 20 },
    { day: 'Saturday', hour: '16:00', engagement: 4.7, posts: 22 },
    { day: 'Sunday', hour: '17:00', engagement: 4.3, posts: 16 }
  ],

  // H. Top Performing Content
  topContent: [
    {
      id: 1,
      type: 'Reel',
      platform: 'Instagram',
      title: 'Travel Vlog - Goa Adventure',
      likes: 15200,
      comments: 890,
      shares: 234,
      views: 125000,
      engagement: 5.8,
      date: '2024-05-01',
      hashtags: ['#travel', '#goa', '#adventure']
    },
    {
      id: 2,
      type: 'Post',
      platform: 'Instagram',
      title: 'Fashion OOTD - Summer Style',
      likes: 12800,
      comments: 650,
      shares: 189,
      views: 89000,
      engagement: 5.2,
      date: '2024-04-28',
      hashtags: ['#fashion', '#ootd', '#summer']
    },
    {
      id: 3,
      type: 'Video',
      platform: 'YouTube',
      title: '10 Travel Tips for Beginners',
      likes: 9800,
      comments: 420,
      shares: 156,
      views: 89000,
      engagement: 4.8,
      date: '2024-04-25',
      hashtags: ['#travel', '#tips', '#beginners']
    }
  ],

  // I. Content-Type Strength
  contentStrength: [
    { type: 'Reels', performance: 95, engagement: 5.2, frequency: 3 },
    { type: 'Posts', performance: 88, engagement: 4.8, frequency: 5 },
    { type: 'Stories', performance: 82, engagement: 4.1, frequency: 8 },
    { type: 'Videos', performance: 90, engagement: 4.9, frequency: 2 },
    { type: 'Carousel', performance: 85, engagement: 4.6, frequency: 4 }
  ],

  // J. Engagement Metrics
  engagement: {
    overall: 4.8,
    byPlatform: [
      { platform: 'Instagram', rate: 5.2, followers: 120000 },
      { platform: 'Facebook', rate: 3.8, followers: 45000 },
      { platform: 'YouTube', rate: 4.5, followers: 80000 }
    ],
    trend: [
      { month: 'Jan', rate: 4.2 },
      { month: 'Feb', rate: 4.4 },
      { month: 'Mar', rate: 4.6 },
      { month: 'Apr', rate: 4.8 },
      { month: 'May', rate: 4.8 }
    ]
  },

  // K. Hashtag Analysis
  hashtags: [
    { tag: '#travel', count: 156, engagement: 5.8, reach: 45000 },
    { tag: '#lifestyle', count: 134, engagement: 4.9, reach: 38000 },
    { tag: '#fashion', count: 98, engagement: 4.6, reach: 32000 },
    { tag: '#adventure', count: 87, engagement: 5.2, reach: 28000 },
    { tag: '#food', count: 76, engagement: 4.3, reach: 25000 },
    { tag: '#fitness', count: 65, engagement: 4.1, reach: 22000 }
  ],

  // L. Brand Collaboration History
  collaborations: [
    {
      brand: 'Nike',
      logo: '',
      campaign: 'Summer Collection',
      reach: 85000,
      engagement: 5.8,
      value: 2500,
      date: '2024-04-15',
      status: 'completed'
    },
    {
      brand: 'Starbucks',
      logo: '',
      campaign: 'New Menu Launch',
      reach: 65000,
      engagement: 4.9,
      value: 1800,
      date: '2024-03-20',
      status: 'completed'
    },
    {
      brand: 'Airbnb',
      logo: '',
      campaign: 'Travel Experiences',
      reach: 72000,
      engagement: 5.4,
      value: 2200,
      date: '2024-02-10',
      status: 'completed'
    }
  ],

  // M. Audience Language & Country
  languages: [
    { language: 'English', percent: 65, engagement: 4.8 },
    { language: 'Hindi', percent: 25, engagement: 4.2 },
    { language: 'Tamil', percent: 8, engagement: 3.9 },
    { language: 'Other', percent: 2, engagement: 3.5 }
  ],

  // Additional Analytics
  growth: {
    followers: 12.5,
    engagement: 8.2,
    reach: 15.3,
    impressions: 18.7
  },

  recentActivity: [
    { 
      type: 'post', 
      platform: 'Instagram', 
      date: '2024-05-01', 
      desc: 'Posted travel reel from Goa', 
      likes: 15200, 
      comments: 890, 
      reach: 125000 
    },
    { 
      type: 'story', 
      platform: 'Instagram', 
      date: '2024-04-30', 
      desc: 'Shared behind-the-scenes', 
      likes: 8900, 
      comments: 450, 
      reach: 78000 
    },
    { 
      type: 'comment', 
      platform: 'YouTube', 
      date: '2024-04-29', 
      desc: 'Replied to fan comments', 
      likes: 4200, 
      comments: 320, 
      reach: 45000 
    },
    { 
      type: 'collaboration', 
      platform: 'All', 
      date: '2024-04-28', 
      desc: 'Nike campaign launch', 
      likes: 85000, 
      comments: 2100, 
      reach: 250000 
    }
  ],

  // AI Summary and Recommendations
  aiInsights: {
    overview: {
      summary: "Cathy Creator demonstrates strong performance across multiple platforms with a balanced content strategy. Her engagement rate of 4.8% is above industry average, and she shows consistent growth patterns. The creator has successfully established herself in the lifestyle and travel niche with authentic content that resonates with her audience.",
      recommendations: [
        "Focus on creating more travel-related content as it performs 23% better than lifestyle posts",
        "Consider expanding to TikTok to reach younger demographics",
        "Increase posting frequency on Instagram from 3 to 5 times per week",
        "Develop more behind-the-scenes content which has 15% higher engagement"
      ],
      strengths: ["High engagement rate", "Consistent growth", "Multi-platform presence", "Authentic content"],
      opportunities: ["TikTok expansion", "Brand collaborations", "Merchandise line", "Course creation"]
    },
    audience: {
      summary: "The audience is predominantly female (65%) with a strong focus on the 18-34 age group (77%). Geographic concentration in major Indian cities provides opportunities for local brand partnerships. The audience shows high engagement with travel and fashion content.",
      recommendations: [
        "Create more content targeting the 25-34 age group as they have the highest purchasing power",
        "Develop partnerships with local brands in Mumbai and Delhi",
        "Consider creating content in Hindi to better connect with 25% of audience",
        "Focus on travel content as it drives 40% higher engagement"
      ],
      strengths: ["Engaged female audience", "Strong geographic presence", "High interaction rates", "Diverse age range"],
      opportunities: ["Local brand partnerships", "Hindi content", "Travel collaborations", "Fashion brand deals"]
    },
    content: {
      summary: "Reels are the top-performing content type with 95% performance score. Travel content generates the highest engagement, followed by fashion and lifestyle. The creator excels at storytelling and authentic content creation.",
      recommendations: [
        "Increase Reels production to 5-7 per week as they drive highest engagement",
        "Develop more travel vlog series as they perform 40% better than single posts",
        "Create more interactive content like polls and Q&A sessions",
        "Focus on morning posting times (6-8 AM) for 25% higher engagement"
      ],
      strengths: ["Strong Reels performance", "Authentic storytelling", "Consistent quality", "Good hashtag strategy"],
      opportunities: ["Video series", "Live streaming", "Interactive content", "Cross-platform content"]
    },
    performance: {
      summary: "Instagram is the strongest platform with 5.2% engagement rate. YouTube shows good growth potential. Hashtag strategy is effective with #travel and #lifestyle driving highest engagement. Overall performance is trending upward.",
      recommendations: [
        "Optimize hashtag strategy by using more location-specific tags",
        "Increase YouTube upload frequency to capitalize on growing audience",
        "Develop more sponsored content as it drives 30% higher reach",
        "Focus on creating shareable content to increase organic reach"
      ],
      strengths: ["High Instagram engagement", "Effective hashtag strategy", "Strong brand collaborations", "Growing YouTube presence"],
      opportunities: ["YouTube expansion", "Sponsored content", "Affiliate marketing", "Product launches"]
    },
    growth: {
      summary: "The creator shows healthy growth across all metrics with 12.5% follower growth and 8.2% engagement growth. Best posting times are identified and should be leveraged for maximum reach. Growth is sustainable and organic.",
      recommendations: [
        "Post more content during peak engagement hours (6-8 PM) for 35% higher reach",
        "Develop a content calendar to maintain consistent posting schedule",
        "Focus on Friday and Saturday posts as they drive highest engagement",
        "Consider launching a newsletter to build direct audience connection"
      ],
      strengths: ["Consistent growth", "Organic audience", "Sustainable metrics", "Good timing strategy"],
      opportunities: ["Newsletter launch", "Community building", "Exclusive content", "Membership programs"]
    },
    collaboration: {
      summary: "Strong track record with major brands including Nike, Starbucks, and Airbnb. Campaigns show excellent performance with high engagement rates. The creator is well-positioned for premium brand partnerships.",
      recommendations: [
        "Pitch to luxury travel brands as travel content performs exceptionally well",
        "Develop more long-term brand partnerships for consistent revenue",
        "Create case studies of successful campaigns to attract new brands",
        "Consider launching own product line based on audience feedback"
      ],
      strengths: ["Proven brand partnerships", "High campaign performance", "Diverse brand portfolio", "Professional approach"],
      opportunities: ["Luxury brand partnerships", "Product launches", "Agency representation", "Speaking opportunities"]
    }
  }
};

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899'  // Pink
];

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '& .recharts-pie': {
    transition: 'all 0.3s ease',
  },
  '& .recharts-pie-sector:hover': {
    transform: 'scale(1.05)',
    filter: 'brightness(1.1)',
  },
}));

const MetricCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 20,
  padding: theme.spacing(4),
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  minHeight: 160,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  }
}));

const CreatorProfile: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Creator ID is missing');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulate API call to fetch creator data based on ID
    setTimeout(() => {
      setLoading(false);
      // In a real app, you would fetch creator data here using the ID
      console.log('Loading creator profile for ID:', id);
    }, 1000);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string = '#667eea') => (
    <MetricCard sx={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 36 } })}
        </Box>
        <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
          {value}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500, fontSize: '0.95rem' }}>
          {title}
        </Typography>
      </Box>
    </MetricCard>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Creator ID: {id || 'Not provided'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
        minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4,
      px: { xs: 2, md: 4 }
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <StyledCard sx={{ mb: 4, p: 6 }}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
        <Avatar
                  src={creatorData.avatar}
          sx={{
                    width: 140,
                    height: 140,
            bgcolor: 'primary.main',
                    fontSize: 56,
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    border: '4px solid white',
                    mb: 3
                  }}
                >
                  {creatorData.name.split(' ').map(n => n[0]).join('')}
        </Avatar>
                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  {creatorData.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6, maxWidth: 300, mx: 'auto' }}>
                  {creatorData.bio}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<Instagram />} 
                    label="Instagram" 
                    color="primary" 
                    sx={{ px: 2, py: 1, fontSize: '0.9rem' }}
                  />
                  <Chip 
                    icon={<Facebook />} 
                    label="Facebook" 
                    color="primary" 
                    sx={{ px: 2, py: 1, fontSize: '0.9rem' }}
                  />
                  <Chip 
                    icon={<YouTube />} 
                    label="YouTube" 
                    color="primary" 
                    sx={{ px: 2, py: 1, fontSize: '0.9rem' }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Grid container spacing={4}>
                  {renderMetricCard('Total Followers', creatorData.profile.followers.toLocaleString(), <People />, '#667eea')}
                  {renderMetricCard('Engagement Rate', `${creatorData.engagement.overall}%`, <Analytics />, '#f093fb')}
                  {renderMetricCard('Growth Rate', `${creatorData.growth.followers}%`, <TrendingUp />, '#4facfe')}
                  {renderMetricCard('Content Count', creatorData.profile.mediaCount.toLocaleString(), <ContentPaste />, '#43e97b')}
                </Grid>
              </Grid>
            </Grid>
          </StyledCard>
        </Fade>

        {/* Analytics Tabs */}
        <StyledCard sx={{ mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<Analytics />} label="Overview" />
            <Tab icon={<People />} label="Audience" />
            <Tab icon={<ContentPaste />} label="Content" />
            <Tab icon={<Campaign />} label="Performance" />
            <Tab icon={<Timeline />} label="Growth" />
            <Tab icon={<Business />} label="Collaborations" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Zoom in timeout={500}>
                <Grid container spacing={3}>
                  {/* Categories */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        <Category sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Content Categories
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {creatorData.categories.subcategories[creatorData.categories.primary as keyof typeof creatorData.categories.subcategories]?.map((cat: string, index: number) => (
                          <Chip key={cat} label={cat} color="primary" variant="outlined" />
                        ))}
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={creatorData.categories.confidence} 
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        AI Classification Confidence: {creatorData.categories.confidence}%
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Location Influence */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Top Locations
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <ChartContainer sx={{ width: '100%', height: 300, mb: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={creatorData.location.audience.slice(0, 4)}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={40}
                                dataKey="percent"
                                paddingAngle={2}
                              >
                                {creatorData.location.audience.slice(0, 4).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <ReTooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <Box sx={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #ccc',
                                        borderRadius: 2,
                                        p: 1,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                      }}>
                                        <Typography variant="body2" fontWeight="bold">
                                          {data.city}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {data.percent}% of audience
                                        </Typography>
                                        <Typography variant="body2" color="primary">
                                          Engagement: {data.engagement}%
                                        </Typography>
                                      </Box>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                            {creatorData.location.audience.slice(0, 4).map((entry, index) => (
                              <Box key={entry.city} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%', 
                                  bgcolor: COLORS[index % COLORS.length],
                                  mr: 0.5
                                }} />
                                <Typography variant="body2">
                                  {entry.city} ({entry.percent}%)
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Promotable Products */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Products They Can Promote
                    </Typography>
                    <Grid container spacing={2}>
                      {creatorData.promotableProducts.map((category, index) => (
                        <Grid item xs={12} sm={6} md={4} key={category.category}>
                          <Card sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              {category.category}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              {category.products.map(product => (
                                <Chip key={product} label={product} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
          ))}
        </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={category.confidence} 
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Confidence: {category.confidence}%
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </Zoom>
            )}

            {activeTab === 1 && (
              <Slide direction="up" in timeout={500}>
                <Grid container spacing={3}>
                  {/* Audience Demographics */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Gender Distribution
                    </Typography>
                                         <ChartContainer>
                       <ResponsiveContainer width="100%" height={250}>
                         <PieChart>
                           <Pie
                             data={creatorData.audienceGender}
                             cx="50%"
                             cy="50%"
                             outerRadius={80}
                             innerRadius={30}
                             dataKey="percent"
                             paddingAngle={2}
                           >
                             {creatorData.audienceGender.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                           </Pie>
                           <ReTooltip 
                             content={({ active, payload }) => {
                               if (active && payload && payload.length) {
                                 const data = payload[0].payload;
                                 return (
                                   <Box sx={{
                                     background: 'rgba(255, 255, 255, 0.95)',
                                     border: '1px solid #ccc',
                                     borderRadius: 2,
                                     p: 1,
                                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                   }}>
                                     <Typography variant="body2" fontWeight="bold">
                                       {data.gender}
                                     </Typography>
                                     <Typography variant="body2" color="text.secondary">
                                       {data.percent}% of audience
                                     </Typography>
                                   </Box>
                                 );
                               }
                               return null;
                             }}
                           />
                         </PieChart>
                       </ResponsiveContainer>
                     </ChartContainer>
                     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                         {creatorData.audienceGender.map((entry, index) => (
                           <Box key={entry.gender} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <Box sx={{ 
                               width: 12, 
                               height: 12, 
                               borderRadius: '50%', 
                               bgcolor: entry.color,
                               mr: 0.5
                             }} />
                             <Typography variant="body2">
                               {entry.gender} ({entry.percent}%)
                             </Typography>
                           </Box>
                         ))}
                       </Box>
                     </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      <Cake sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Age Distribution
                    </Typography>
                                         <ResponsiveContainer width="100%" height={200}>
                       <ReBarChart data={creatorData.audienceAge}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="age" />
                         <YAxis />
                         <ReTooltip />
                         <Bar dataKey="percent" fill="#8884d8" />
                       </ReBarChart>
                     </ResponsiveContainer>
                  </Grid>

                  {/* Languages */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Language Distribution
                    </Typography>
                                         <ResponsiveContainer width="100%" height={200}>
                       <ReBarChart data={creatorData.languages}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="language" />
                         <YAxis />
                         <ReTooltip />
                         <Bar dataKey="percent" fill="#82ca9d" />
                       </ReBarChart>
                     </ResponsiveContainer>
                  </Grid>

                  {/* Countries */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      <Flag sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Top Countries
                    </Typography>
                                         <ResponsiveContainer width="100%" height={200}>
                       <ReBarChart data={creatorData.location.countries}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="country" />
                         <YAxis />
                         <ReTooltip />
                         <Bar dataKey="percent" fill="#ffc658" />
                       </ReBarChart>
                     </ResponsiveContainer>
                  </Grid>
                </Grid>
              </Slide>
            )}

            {activeTab === 2 && (
              <Fade in timeout={500}>
                <Grid container spacing={3}>
                  {/* Content Performance */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <ContentPaste sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Content Type Performance
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={creatorData.contentStrength}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <ReTooltip />
                        <Bar dataKey="performance" fill="#8884d8" />
                        <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* Top Content */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Top Performing Content
                    </Typography>
                    <Grid container spacing={2}>
                      {creatorData.topContent.map((content, index) => (
                        <Grid item xs={12} md={4} key={content.id}>
                          <Card sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Chip 
                                label={content.type} 
                                color="primary" 
                                size="small" 
                                sx={{ mr: 1 }}
                              />
                              <Chip 
                                label={content.platform} 
                                color="secondary" 
                                size="small"
                              />
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              {content.title}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                <Favorite sx={{ fontSize: 16, mr: 0.5 }} />
                                {content.likes.toLocaleString()}
                              </Typography>
                              <Typography variant="body2">
                                <Comment sx={{ fontSize: 16, mr: 0.5 }} />
                                {content.comments.toLocaleString()}
                              </Typography>
                              <Typography variant="body2">
                                <Share sx={{ fontSize: 16, mr: 0.5 }} />
                                {content.shares.toLocaleString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {content.hashtags.map(tag => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </Fade>
            )}

            {activeTab === 3 && (
              <Zoom in timeout={500}>
                <Grid container spacing={3}>
                  {/* Engagement Metrics */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Engagement by Platform
                    </Typography>
                                         <ResponsiveContainer width="100%" height={250}>
                       <ReBarChart data={creatorData.engagement.byPlatform}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="platform" />
                         <YAxis />
                         <ReTooltip />
                         <Bar dataKey="rate" fill="#8884d8" />
                       </ReBarChart>
                     </ResponsiveContainer>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Engagement Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={creatorData.engagement.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ReTooltip />
                        <Line type="monotone" dataKey="rate" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* Hashtag Analysis */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <Tag sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Top Hashtags Performance
                    </Typography>
                                         <ResponsiveContainer width="100%" height={300}>
                       <ReBarChart data={creatorData.hashtags} layout="horizontal">
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis type="number" />
                         <YAxis dataKey="tag" type="category" width={100} />
                         <ReTooltip />
                         <Bar dataKey="engagement" fill="#8884d8" />
                       </ReBarChart>
                     </ResponsiveContainer>
                  </Grid>
                </Grid>
              </Zoom>
            )}

            {activeTab === 4 && (
              <Slide direction="left" in timeout={500}>
                <Grid container spacing={3}>
                  {/* Growth Metrics */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Growth Metrics
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={[
                        { metric: 'Followers', value: creatorData.growth.followers, fullMark: 20 },
                        { metric: 'Engagement', value: creatorData.growth.engagement, fullMark: 20 },
                        { metric: 'Reach', value: creatorData.growth.reach, fullMark: 20 },
                        { metric: 'Impressions', value: creatorData.growth.impressions, fullMark: 20 }
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={30} domain={[0, 20]} />
                        <Radar name="Growth" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Best Posting Times
                    </Typography>
                                         <ResponsiveContainer width="100%" height={250}>
                       <ReBarChart data={creatorData.bestTimes}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="day" />
                         <YAxis />
                         <ReTooltip />
                         <Bar dataKey="engagement" fill="#82ca9d" />
                       </ReBarChart>
                     </ResponsiveContainer>
                  </Grid>
                </Grid>
              </Slide>
            )}

            {activeTab === 5 && (
              <Fade in timeout={500}>
                <Grid container spacing={3}>
                  {/* Brand Collaborations */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Brand Collaboration History
                    </Typography>
                    <Grid container spacing={2}>
                      {creatorData.collaborations.map((collab, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Card sx={{ p: 3, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                {collab.brand.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight="bold">
                                  {collab.brand}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {collab.campaign}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Reach
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {collab.reach.toLocaleString()}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Engagement
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {collab.engagement}%
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Value
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                  {collab.value}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip 
                              label={collab.status} 
                              color={collab.status === 'completed' ? 'success' : 'warning'}
                              size="small"
                            />
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Recent Activity */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Recent Activity
                    </Typography>
                                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                       {creatorData.recentActivity.map((activity, index) => (
                         <Card key={index} sx={{ p: 3 }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center' }}>
                               <Avatar sx={{ mr: 3, bgcolor: 'primary.main', width: 48, height: 48 }}>
                                 {activity.type.charAt(0).toUpperCase()}
                               </Avatar>
                               <Box>
                                 <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                                   {activity.desc}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   {activity.platform} • {activity.date}
                                 </Typography>
                               </Box>
                             </Box>
                             <Box sx={{ display: 'flex', gap: 3 }}>
                               <Box sx={{ textAlign: 'center' }}>
                                 <Typography variant="h6" color="primary" fontWeight="bold">
                                   {activity.likes.toLocaleString()}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   Likes
                                 </Typography>
                               </Box>
                               <Box sx={{ textAlign: 'center' }}>
                                 <Typography variant="h6" color="secondary" fontWeight="bold">
                                   {activity.comments.toLocaleString()}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   Comments
                                 </Typography>
                               </Box>
                               <Box sx={{ textAlign: 'center' }}>
                                 <Typography variant="h6" color="success.main" fontWeight="bold">
                                   {activity.reach.toLocaleString()}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary">
                                   Reach
                                 </Typography>
                               </Box>
                             </Box>
                           </Box>
                         </Card>
                       ))}
                     </Box>
                  </Grid>
                </Grid>
              </Fade>
            )}
          </Box>
        </StyledCard>

        {/* AI Summary and Recommendations */}
        <Fade in timeout={1000}>
          <StyledCard sx={{ mb: 4 }}>
            <Box sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <AutoGraph sx={{ mr: 2, color: 'primary.main' }} />
                AI Summary & Recommendations
              </Typography>
              
              <Grid container spacing={4}>
                {/* Overview */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>📊</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Overview Analysis
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                      {creatorData.aiInsights.overview.summary}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
                      💡 Key Recommendations:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      {creatorData.aiInsights.overview.recommendations.map((rec, index) => (
                        <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                          {rec}
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      {creatorData.aiInsights.overview.strengths.map((strength, index) => (
                        <Chip 
                          key={index} 
                          label={strength} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(102, 126, 234, 0.1)', 
                            color: '#667eea',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            fontWeight: 500
                          }} 
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>

                {/* Audience */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>👥</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Audience Insights
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                      {creatorData.aiInsights.audience.summary}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
                      🎯 Strategic Actions:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      {creatorData.aiInsights.audience.recommendations.map((rec, index) => (
                        <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                          {rec}
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      {creatorData.aiInsights.audience.opportunities.map((opp, index) => (
                        <Chip 
                          key={index} 
                          label={opp} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(240, 147, 251, 0.1)', 
                            color: '#f093fb',
                            border: '1px solid rgba(240, 147, 251, 0.2)',
                            fontWeight: 500
                          }} 
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>

                {/* Content */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>📱</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Content Strategy
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                      {creatorData.aiInsights.content.summary}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
                      🚀 Optimization Tips:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      {creatorData.aiInsights.content.recommendations.map((rec, index) => (
                        <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                          {rec}
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      {creatorData.aiInsights.content.strengths.map((strength, index) => (
                        <Chip 
                          key={index} 
                          label={strength} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(79, 172, 254, 0.1)', 
                            color: '#4facfe',
                            border: '1px solid rgba(79, 172, 254, 0.2)',
                            fontWeight: 500
                          }} 
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>

                {/* Performance */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>📈</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Performance Metrics
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                      {creatorData.aiInsights.performance.summary}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
                      📊 Growth Strategies:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      {creatorData.aiInsights.performance.recommendations.map((rec, index) => (
                        <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                          {rec}
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      {creatorData.aiInsights.performance.opportunities.map((opp, index) => (
                        <Chip 
                          key={index} 
                          label={opp} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(67, 233, 123, 0.1)', 
                            color: '#43e97b',
                            border: '1px solid rgba(67, 233, 123, 0.2)',
                            fontWeight: 500
                          }} 
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>

                {/* Growth */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>📈</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Growth Analysis
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                      {creatorData.aiInsights.growth.summary}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
                      🎯 Growth Tactics:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      {creatorData.aiInsights.growth.recommendations.map((rec, index) => (
                        <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                          {rec}
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      {creatorData.aiInsights.growth.strengths.map((strength, index) => (
                        <Chip 
                          key={index} 
                          label={strength} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(250, 112, 154, 0.1)', 
                            color: '#fa709a',
                            border: '1px solid rgba(250, 112, 154, 0.2)',
                            fontWeight: 500
                          }} 
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>

                {/* Collaboration */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    p: 3, 
                    height: '100%', 
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>🤝</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Collaboration Opportunities
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'text.secondary' }}>
                      {creatorData.aiInsights.collaboration.summary}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
                      💼 Partnership Strategies:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      {creatorData.aiInsights.collaboration.recommendations.map((rec, index) => (
                        <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                          {rec}
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                      {creatorData.aiInsights.collaboration.strengths.map((strength, index) => (
                        <Chip 
                          key={index} 
                          label={strength} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(168, 237, 234, 0.1)', 
                            color: '#a8edea',
                            border: '1px solid rgba(168, 237, 234, 0.2)',
                            fontWeight: 500
                          }} 
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </StyledCard>
        </Fade>
      </Box>
    </Box>
  );
};

export default CreatorProfile; 