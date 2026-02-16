import { Typography, Container, Grid, CardContent, styled, keyframes } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { School, VideoLibrary, Group, EmojiEvents, Chat, CalendarToday } from '@mui/icons-material';

const _shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const SectionContainer = styled(Container)`
  padding: 8rem 2rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
  position: relative;
  overflow: hidden;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const SectionSubtitle = styled(Typography)`
  font-size: 1.3rem;
  text-align: center;
  color: #666;
  margin-bottom: 5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
`;

const FeatureCard = styled(motion.div)`
  height: 100%;
  border-radius: 24px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.25);
    border-color: #667eea;
    
    &::before {
      left: 100%;
    }
  }
`;

const IconContainer = styled(motion.div)`
  width: 100px;
  height: 100px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::after {
    width: 200px;
    height: 200px;
  }
`;

const FeatureTitle = styled(Typography)`
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #1a1a1a;
`;

const FeatureDescription = styled(Typography)`
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
`;

const VideoPreview = styled(motion.div)`
  width: 100%;
  height: 200px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '▶';
    font-size: 4rem;
    color: white;
    opacity: 0.8;
    animation: ${float} 2s ease-in-out infinite;
  }
`;

export const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: <School sx={{ fontSize: 50, color: 'white' }} />,
      title: 'Interactive Course Creation',
      description: 'Design comprehensive learning programs with multimedia content, assessments, and progress tracking. Build structured curricula that keep students engaged and motivated throughout their learning journey.',
      color: '#667eea',
    },
    {
      icon: <VideoLibrary sx={{ fontSize: 50, color: 'white' }} />,
      title: 'Live Workshop Hosting',
      description: 'Conduct real-time interactive sessions with integrated video conferencing. Track attendance, enable live Q&A, and seamlessly integrate product sales during your presentations.',
      color: '#f093fb',
    },
    {
      icon: <Group sx={{ fontSize: 50, color: 'white' }} />,
      title: 'Premium Membership Tiers',
      description: 'Create exclusive subscription-based communities with tiered access levels. Offer recurring revenue streams through members-only content, resources, and personalized experiences.',
      color: '#4facfe',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 50, color: 'white' }} />,
      title: 'Engagement & Gamification',
      description: 'Boost participation with points, badges, and leaderboards. Turn learning into an exciting game where students compete, collaborate, and celebrate achievements together.',
      color: '#fa709a',
    },
    {
      icon: <Chat sx={{ fontSize: 50, color: 'white' }} />,
      title: 'One-on-One Consultations',
      description: 'Schedule and manage private coaching sessions effortlessly. Allow students to book time slots, manage calendars, and conduct personalized mentoring sessions.',
      color: '#30cfd0',
    },
    {
      icon: <CalendarToday sx={{ fontSize: 50, color: 'white' }} />,
      title: 'Community Building Tools',
      description: 'Foster connections with social feed features, discussion forums, and peer-to-peer interactions. Create a vibrant ecosystem where learners support and learn from each other.',
      color: '#a8edea',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <SectionContainer ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <SectionTitle
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          Everything You Need to Build Your Knowledge Empire
        </SectionTitle>
        <SectionSubtitle>
          Powerful features designed to help you create, teach, and grow your educational business
        </SectionSubtitle>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div variants={itemVariants}>
                <FeatureCard
                  whileHover={{ 
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <IconContainer
                      sx={{ 
                        background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                      }}
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {feature.icon}
                    </IconContainer>
                    <FeatureTitle>{feature.title}</FeatureTitle>
                    <FeatureDescription>{feature.description}</FeatureDescription>
                    <VideoPreview
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </SectionContainer>
  );
};
