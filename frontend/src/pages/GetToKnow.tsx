import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Avatar, Chip, Accordion, AccordionSummary, AccordionDetails, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SchoolIcon from '@mui/icons-material/School';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ChatIcon from '@mui/icons-material/Chat';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import { User as BaseUser } from '../services/userService';

// Extend User type to include categories
type User = BaseUser & {
  categories?: Array<{
    mainCategoryId: string;
    subCategoryIds: string[];
    _id?: string;
  }>;
};

// Creator-specific pillars
const creatorPillars = [
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Learn',
    desc: 'Access courses, attend workshops, and level up your skills with industry experts.',
    emoji: '🧠',
  },
  {
    icon: <VideoLibraryIcon color="secondary" sx={{ fontSize: 40 }} />,
    title: 'Create & Share',
    desc: 'Build premium content (videos, guides, PDFs), sell them, or offer them for free.',
    emoji: '🎥',
  },
  {
    icon: <ChatIcon color="info" sx={{ fontSize: 40 }} />,
    title: 'Engage',
    desc: 'Host live chats, Q&As, events, and build your own community space.',
    emoji: '💬',
  },
  {
    icon: <MonetizationOnIcon color="success" sx={{ fontSize: 40 }} />,
    title: 'Monetize',
    desc: 'Earn through subscriptions, tips (coins/donations), bookings, and brand collabs.',
    emoji: '💸',
  },
  {
    icon: <BarChartIcon color="warning" sx={{ fontSize: 40 }} />,
    title: 'Track & Grow',
    desc: 'View real-time analytics on views, earnings, audience, and campaign performance.',
    emoji: '📊',
  },
  {
    icon: <SupportAgentIcon color="secondary" sx={{ fontSize: 40 }} />,
    title: 'KYC & Verification',
    desc: 'Submit KYC documents, track status, and unlock more earning opportunities.',
    emoji: '🛡️',
  },
  {
    icon: <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />,
    title: 'Brand Collabs',
    desc: 'Get matched with brands for campaigns and collaborations.',
    emoji: '🤝',
  },
  {
    icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 40 }} />,
    title: 'Creator Spotlights',
    desc: 'Get featured as a trending creator and inspire others.',
    emoji: '🌟',
  },
  {
    icon: <GroupIcon color="info" sx={{ fontSize: 40 }} />,
    title: 'Community Management',
    desc: 'Build, moderate, and grow your own fan community.',
    emoji: '👥',
  },
  {
    icon: <LiveTvIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Top Posts & Analytics',
    desc: 'See your best-performing content and audience insights.',
    emoji: '📈',
  },
  {
    icon: <MonetizationOnIcon color="success" sx={{ fontSize: 40 }} />,
    title: 'Withdrawals & Payouts',
    desc: 'Withdraw your earnings and track payout status in real time.',
    emoji: '🏦',
  },
  {
    icon: <BarChartIcon color="warning" sx={{ fontSize: 40 }} />,
    title: 'Security & Privacy',
    desc: 'Full control over your content, audience, and data privacy.',
    emoji: '🔒',
  },
];

// Learner-specific pillars
const learnerPillars = [
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Discover Courses',
    desc: 'Explore a vast library of courses across different subjects and skill levels.',
    emoji: '📚',
  },
  {
    icon: <VideoLibraryIcon color="secondary" sx={{ fontSize: 40 }} />,
    title: 'Learn at Your Pace',
    desc: 'Access video lessons, interactive content, and downloadable resources anytime.',
    emoji: '⏰',
  },
  {
    icon: <ChatIcon color="info" sx={{ fontSize: 40 }} />,
    title: 'Connect with Peers',
    desc: 'Join study groups, participate in discussions, and learn from fellow learners.',
    emoji: '👥',
  },
  {
    icon: <SupportAgentIcon color="secondary" sx={{ fontSize: 40 }} />,
    title: 'Get Expert Help',
    desc: 'Access 24/7 support, ask questions, and get guidance from instructors.',
    emoji: '🎓',
  },
  {
    icon: <BarChartIcon color="warning" sx={{ fontSize: 40 }} />,
    title: 'Track Progress',
    desc: 'Monitor your learning journey with detailed progress reports and achievements.',
    emoji: '📊',
  },
  {
    icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 40 }} />,
    title: 'Earn Certificates',
    desc: 'Complete courses and earn verified certificates to showcase your skills.',
    emoji: '🏆',
  },
  {
    icon: <LiveTvIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Live Sessions',
    desc: 'Attend live workshops, Q&A sessions, and interactive learning events.',
    emoji: '🎥',
  },
  {
    icon: <GroupIcon color="info" sx={{ fontSize: 40 }} />,
    title: 'Study Groups',
    desc: 'Join or create study groups to collaborate and learn together.',
    emoji: '🤝',
  },
  {
    icon: <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />,
    title: 'Skill Assessments',
    desc: 'Take quizzes and assessments to test your knowledge and identify areas for improvement.',
    emoji: '📝',
  },
  {
    icon: <MonetizationOnIcon color="success" sx={{ fontSize: 40 }} />,
    title: 'Free & Premium Content',
    desc: 'Access both free learning materials and premium courses based on your needs.',
    emoji: '💎',
  },
  {
    icon: <BarChartIcon color="warning" sx={{ fontSize: 40 }} />,
    title: 'Learning Analytics',
    desc: 'Get insights into your learning patterns, strengths, and areas for growth.',
    emoji: '📈',
  },
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 40 }} />,
    title: 'Personalized Learning',
    desc: 'Get customized learning paths and recommendations based on your interests.',
    emoji: '🎯',
  },
];

// Creator journey steps
const creatorJourneySteps = [
  {
    label: 'Set up your profile',
    desc: 'Tell your story & showcase your vibe.',
    badge: 'Starter',
  },
  {
    label: 'Pick your content pillars',
    desc: 'What will your audience love most?',
    badge: 'Explorer',
  },
  {
    label: 'Upload your first drop',
    desc: 'A course, guide, or resource.',
    badge: 'Creator',
  },
  {
    label: 'Engage your community',
    desc: 'Start a Q&A or mini live.',
    badge: 'Connector',
  },
  {
    label: 'Monetize',
    desc: 'Set your pricing tiers or accept fan tips.',
    badge: 'Earner',
  },
  {
    label: 'Grow',
    desc: 'Use insights, workshops, and collabs to keep scaling.',
    badge: 'Pro',
  },
];

// Learner journey steps
const learnerJourneySteps = [
  {
    label: 'Complete your profile',
    desc: 'Set your learning goals and interests.',
    badge: 'Newbie',
  },
  {
    label: 'Explore courses',
    desc: 'Browse and discover courses that match your interests.',
    badge: 'Explorer',
  },
  {
    label: 'Start learning',
    desc: 'Enroll in your first course and begin your journey.',
    badge: 'Student',
  },
  {
    label: 'Track progress',
    desc: 'Monitor your learning progress and achievements.',
    badge: 'Tracker',
  },
  {
    label: 'Earn certificates',
    desc: 'Complete courses and earn verified certificates.',
    badge: 'Achiever',
  },
  {
    label: 'Share knowledge',
    desc: 'Help others and share your learning experiences.',
    badge: 'Mentor',
  },
];

// Creator help cards
const creatorHelpCards = [
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 36 }} />,
    title: 'Learning Hub',
    desc: 'For skill upgrades.',
  },
  {
    icon: <SupportAgentIcon color="secondary" sx={{ fontSize: 36 }} />,
    title: 'Creator Support Team',
    desc: 'Always available to guide.',
  },
  {
    icon: <TrendingUpIcon color="success" sx={{ fontSize: 36 }} />,
    title: 'Brand Opportunities',
    desc: 'Algorithm matches you to suitable brands.',
  },
  {
    icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 36 }} />,
    title: 'Trending Creator Spotlights',
    desc: 'Feature the best creators every week.',
  },
  {
    icon: <BarChartIcon color="info" sx={{ fontSize: 36 }} />,
    title: 'Dynamic Insights',
    desc: 'Learn what works and what to tweak.',
  },
];

// Learner help cards
const learnerHelpCards = [
  {
    icon: <SchoolIcon color="primary" sx={{ fontSize: 36 }} />,
    title: 'Course Library',
    desc: 'Access thousands of courses across all subjects.',
  },
  {
    icon: <SupportAgentIcon color="secondary" sx={{ fontSize: 36 }} />,
    title: 'Learning Support',
    desc: 'Get help from instructors and support team.',
  },
  {
    icon: <GroupIcon color="success" sx={{ fontSize: 36 }} />,
    title: 'Study Groups',
    desc: 'Connect with fellow learners and study together.',
  },
  {
    icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 36 }} />,
    title: 'Achievement System',
    desc: 'Earn badges and certificates for your progress.',
  },
  {
    icon: <BarChartIcon color="info" sx={{ fontSize: 36 }} />,
    title: 'Progress Tracking',
    desc: 'Monitor your learning journey and performance.',
  },
];

// Creator FAQs
const creatorFaqs = [
  {
    q: 'Do I need followers to earn?',
    a: 'No! You can start earning from day one through content sales, subscriptions, and tips, regardless of your follower count.',
  },
  {
    q: 'How do payouts work?',
    a: 'Payouts are processed weekly to your linked account. You can track your earnings and withdrawal status in real time.',
  },
  {
    q: 'Can I offer both free and paid content?',
    a: 'Absolutely! Mix and match free resources, premium drops, and exclusive events to fit your strategy.',
  },
];

// Learner FAQs
const learnerFaqs = [
  {
    q: 'Are there free courses available?',
    a: 'Yes! We offer both free and premium courses. You can start learning immediately with our free content and upgrade to premium courses when you\'re ready.',
  },
  {
    q: 'How do I track my learning progress?',
    a: 'Our platform provides detailed progress tracking, including course completion percentages, time spent learning, and achievement badges.',
  },
  {
    q: 'Can I get certificates for completed courses?',
    a: 'Absolutely! Complete courses and earn verified certificates that you can share on LinkedIn and other professional platforms.',
  },
  {
    q: 'Is there support available if I get stuck?',
    a: 'Yes! We provide 24/7 support through our help center, and you can also connect with instructors and fellow learners in study groups.',
  },
];

// Creator testimonials
const creatorTestimonials = [
  {
    name: 'Ava Creator',
    quote: 'I tripled my income in 2 months on this platform. The community and tools are next-level!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Jay Storyteller',
    quote: 'Finally, a place where my content and fans are truly mine. The analytics and support are amazing.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
];

// Learner testimonials
const learnerTestimonials = [
  {
    name: 'Sarah Student',
    quote: 'I completed 5 courses in 3 months and got a promotion at work! The learning experience is incredible.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    name: 'Mike Learner',
    quote: 'The personalized learning paths helped me master new skills quickly. The community support is amazing!',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
];

// Creator feature highlights
const creatorFeatureHighlights = [
  { icon: <VideoLibraryIcon color="primary" sx={{ fontSize: 32 }} />, label: 'Premium Content' },
  { icon: <MonetizationOnIcon color="success" sx={{ fontSize: 32 }} />, label: 'Subscriptions & Tips' },
  { icon: <TrendingUpIcon color="secondary" sx={{ fontSize: 32 }} />, label: 'Brand Collabs' },
  { icon: <BarChartIcon color="warning" sx={{ fontSize: 32 }} />, label: 'Analytics' },
  { icon: <SupportAgentIcon color="info" sx={{ fontSize: 32 }} />, label: '24/7 Support' },
  { icon: <SchoolIcon color="primary" sx={{ fontSize: 32 }} />, label: 'Learning Hub' },
  { icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 32 }} />, label: 'Spotlights' },
  { icon: <GroupIcon color="info" sx={{ fontSize: 32 }} />, label: 'Community' },
  { icon: <LiveTvIcon color="primary" sx={{ fontSize: 32 }} />, label: 'Live Events' },
  { icon: <BarChartIcon color="success" sx={{ fontSize: 32 }} />, label: 'Withdrawals' },
  { icon: <BarChartIcon color="secondary" sx={{ fontSize: 32 }} />, label: 'Privacy & Security' },
];

// Learner feature highlights
const learnerFeatureHighlights = [
  { icon: <SchoolIcon color="primary" sx={{ fontSize: 32 }} />, label: 'Course Library' },
  { icon: <VideoLibraryIcon color="secondary" sx={{ fontSize: 32 }} />, label: 'Video Lessons' },
  { icon: <GroupIcon color="success" sx={{ fontSize: 32 }} />, label: 'Study Groups' },
  { icon: <BarChartIcon color="warning" sx={{ fontSize: 32 }} />, label: 'Progress Tracking' },
  { icon: <SupportAgentIcon color="info" sx={{ fontSize: 32 }} />, label: '24/7 Support' },
  { icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 32 }} />, label: 'Certificates' },
  { icon: <LiveTvIcon color="primary" sx={{ fontSize: 32 }} />, label: 'Live Sessions' },
  { icon: <ChatIcon color="info" sx={{ fontSize: 32 }} />, label: 'Discussion Forums' },
  { icon: <TrendingUpIcon color="success" sx={{ fontSize: 32 }} />, label: 'Skill Assessments' },
  { icon: <BarChartIcon color="secondary" sx={{ fontSize: 32 }} />, label: 'Learning Analytics' },
  { icon: <SchoolIcon color="primary" sx={{ fontSize: 32 }} />, label: 'Personalized Paths' },
];

const GetToKnow: React.FC = () => {
  const theme = useTheme();
  const { user: rawUser } = useAuth();
  const user = rawUser as User;

  // Determine user role
  const userRole = user?.role?.name;
  const isLearner = userRole === 'Learner';
  const isCreator = userRole === 'Creator';

  // State for all available categories
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    // Fetch all available categories
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/creator-categories');
        const data = await res.json();
        setAllCategories(data);
      } catch (err) {
        setAllCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Helper: Map user categories to full objects
  const mappedCategories = (user?.categories || []).map(
    (cat: { mainCategoryId: string; subCategoryIds: string[]; _id?: string }, idx: number) => {
      const main = allCategories.find((c: any) => c._id === cat.mainCategoryId || c.id === cat.mainCategoryId);
      if (!main) return null;
      const subcats = (cat.subCategoryIds || []).map((subId: string) => main.subcategories.find((s: any) => s._id === subId || s.id === subId)).filter(Boolean);
      return { ...main, selectedSubcategories: subcats };
    }
  ).filter(Boolean);

  // Get role-specific content (default to creator if role is not recognized)
  const pillars = isLearner ? learnerPillars : creatorPillars;
  const journeySteps = isLearner ? learnerJourneySteps : creatorJourneySteps;
  const helpCards = isLearner ? learnerHelpCards : creatorHelpCards;
  const faqs = isLearner ? learnerFaqs : creatorFaqs;
  const testimonials = isLearner ? learnerTestimonials : creatorTestimonials;
  const featureHighlights = isLearner ? learnerFeatureHighlights : creatorFeatureHighlights;

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1200, mx: 'auto', minHeight: '100vh' }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography variant="h2" fontWeight={900} color="primary" gutterBottom sx={{ letterSpacing: 1, fontSize: { xs: 32, md: 48 } }}>
          {user?.name ? `Welcome, ${user.name}` : `Welcome to ${isLearner ? 'Learning' : 'Creator'}`}
        </Typography>
        <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
          {isLearner 
            ? 'A comprehensive learning platform where you can discover, learn, and grow your skills.'
            : 'A space where creators build, engage, and monetize authentically.'
          }
        </Typography>
        <Typography variant="h6" color="secondary" sx={{ mb: 4, fontWeight: 500 }}>
          {isLearner 
            ? 'Access thousands of courses, connect with fellow learners, and track your progress with <b>personalized learning paths</b>.'
            : 'Unlike generic social platforms, we give you <b>full control</b> over your content, your audience, and your earnings.'
          }
        </Typography>
      </motion.div>

      {/* Platform Map / Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: 48 }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, textAlign: 'center' }}>
          Platform Map: Explore All Features
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {featureHighlights.map((f, idx) => (
            <Grid item xs={6} sm={4} md={3} key={f.label}>
              <motion.div
                whileHover={{ scale: 1.12, rotate: 2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.07 }}
              >
                <Card sx={{ borderRadius: 3, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 2, background: theme.palette.mode === 'dark' ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ mb: 1 }}>{f.icon}</Box>
                  <Typography fontWeight={700} sx={{ fontSize: 16 }}>{f.label}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* What Can You Do Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        style={{ marginBottom: 48 }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          {isLearner ? 'What Can You Do as a Learner Here?' : 'What Can You Do as a Creator Here?'}
        </Typography>
        <Grid container spacing={3}>
          {pillars.map((pillar, idx) => (
            <Grid item xs={12} sm={6} md={4} key={pillar.title}>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(108,99,255,0.18)' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card sx={{ borderRadius: 4, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, boxShadow: 3, background: theme.palette.mode === 'dark' ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ fontSize: 48, mb: 1 }}>{pillar.emoji}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{pillar.title}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 16 }}>{pillar.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Gamified Journey Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: 48 }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          {isLearner ? 'How Can You Start Learning?' : 'How Can You Start?'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          {journeySteps.map((step, idx) => (
            <motion.div
              key={step.label}
              whileHover={{ scale: 1.08 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <Card sx={{ borderRadius: 4, minWidth: 180, minHeight: 160, p: 2, mb: { xs: 2, md: 0 }, boxShadow: 2, background: theme.palette.mode === 'dark' ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Chip label={step.badge} color="primary" sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{step.label}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 15 }}>{step.desc}</Typography>
              </Card>
            </motion.div>
          ))}
        </Box>
        {/* Progress bar */}
        <Box sx={{ mt: 4, width: '100%', maxWidth: 600, mx: 'auto' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, delay: 0.5 }}
            style={{ height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #6C63FF 0%, #00C9A7 100%)' }}
          />
        </Box>
      </motion.div>

      {/* Categories & Subcategories Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: 48 }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: '#6C63FF', textAlign: 'center' }}>
          {isLearner ? 'Your Learning Interests & Categories' : 'Your Categories & Subcategories'}
        </Typography>
        {loadingCategories ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <Typography color="text.secondary">Loading categories...</Typography>
          </Box>
        ) : mappedCategories.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
            <Typography color="text.secondary">No categories selected yet.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {mappedCategories.map((cat, idx) => (
              <Grid item xs={12} sm={6} md={4} key={cat._id || cat.id}>
                <Card sx={{ borderRadius: 4, boxShadow: 4, p: 3, background: 'linear-gradient(120deg, #6C63FF11 0%, #fff 100%)', minHeight: 180 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CategoryIcon sx={{ color: '#6C63FF', fontSize: 36, mr: 1 }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#6C63FF' }}>{cat.name}</Typography>
                  </Box>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>{cat.description}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {cat.selectedSubcategories.map((sub: any) => (
                      <Chip
                        key={sub._id || sub.id}
                        icon={<LabelIcon sx={{ color: '#8F6FFF' }} />}
                        label={sub.name}
                        sx={{ bgcolor: '#F3F0FF', color: '#6C63FF', fontWeight: 600, fontSize: 15, borderRadius: 2, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </motion.div>

      {/* How Do We Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: 48 }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          {isLearner ? 'How Do We Help You Learn & Grow?' : 'How Do We Help You Evolve?'}
        </Typography>
        <Grid container spacing={3}>
          {helpCards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <motion.div
                whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(0,201,167,0.18)' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card sx={{ borderRadius: 4, minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, boxShadow: 3, background: theme.palette.mode === 'dark' ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ mb: 1 }}>{card.icon}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{card.title}</Typography>
                  <Typography color="text.secondary" sx={{ fontSize: 16 }}>{card.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* FAQs & Creator Stories */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
              FAQs
            </Typography>
            {faqs.map((faq, idx) => (
              <Accordion key={faq.q} TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={700}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
              {isLearner ? 'Learner Stories' : 'Creator Stories'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {testimonials.map((t, idx) => (
                <motion.div
                  key={t.name}
                  whileHover={{ scale: 1.04 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card sx={{ borderRadius: 4, p: 3, display: 'flex', alignItems: 'center', gap: 2, background: theme.palette.mode === 'dark' ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,0.95)' }}>
                    <Avatar src={t.avatar} sx={{ width: 56, height: 56, mr: 2 }} />
                    <Box>
                      <Typography fontWeight={700} sx={{ mb: 1 }}>{t.name}</Typography>
                      <Typography color="text.secondary">“{t.quote}”</Typography>
                    </Box>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default GetToKnow; 