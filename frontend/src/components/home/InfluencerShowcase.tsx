import { Box, Typography, Container, CardContent, Avatar, Chip, styled } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { PlayArrow, TrendingUp, People, Star } from '@mui/icons-material';

const SectionContainer = styled(Container)`
  padding: 8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const CreatorCard = styled(motion.div)`
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #f093fb, #4facfe);
    transform: scaleX(0);
    transition: transform 0.4s;
  }
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const VideoThumbnail = styled(motion.div)`
  width: 100%;
  height: 250px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const PlayButton = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const StatsRow = styled(Box)`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const StatItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

export const InfluencerShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const creators = [
    {
      name: 'Sarah Chen',
      role: 'Digital Marketing Expert',
      avatar: 'SC',
      thumbnail: '#667eea',
      stats: { students: '12.5K', revenue: '₹45L', rating: '4.9' },
      courses: ['Advanced SEO', 'Social Media Mastery'],
    },
    {
      name: 'Michael Rodriguez',
      role: 'Programming Instructor',
      avatar: 'MR',
      thumbnail: '#f093fb',
      stats: { students: '8.2K', revenue: '₹32L', rating: '4.8' },
      courses: ['Full Stack Development', 'React Mastery'],
    },
    {
      name: 'Priya Sharma',
      role: 'Yoga & Wellness Coach',
      avatar: 'PS',
      thumbnail: '#4facfe',
      stats: { students: '15.3K', revenue: '₹58L', rating: '5.0' },
      courses: ['Yoga Fundamentals', 'Mindfulness'],
    },
  ];

  return (
    <SectionContainer ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <SectionTitle>Meet Our Top Performing Educators</SectionTitle>
        <Typography
          sx={{
            fontSize: '1.3rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '4rem',
            maxWidth: '700px',
            margin: '0 auto 4rem',
          }}
        >
          See how successful creators are building thriving businesses on our platform
        </Typography>
      </motion.div>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {creators.map((creator, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 100, rotateX: -15 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.2,
              type: 'spring',
              stiffness: 100,
            }}
            style={{ flex: '1 1 300px', maxWidth: '380px' }}
            whileHover={{ y: -10 }}
          >
            <CreatorCard>
              <VideoThumbnail
                style={{ background: `linear-gradient(135deg, ${creator.thumbnail}, ${creator.thumbnail}dd)` }}
                whileHover={{ scale: 1.05 }}
              >
                <PlayButton
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <PlayArrow sx={{ fontSize: 40, color: '#667eea' }} />
                </PlayButton>
              </VideoThumbnail>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: creator.thumbnail,
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {creator.avatar}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a' }}>
                      {creator.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                      {creator.role}
                    </Typography>
                  </Box>
                </Box>

                <StatsRow>
                  <StatItem>
                    <People sx={{ fontSize: 18, color: '#667eea' }} />
                    <span>{creator.stats.students} Students</span>
                  </StatItem>
                  <StatItem>
                    <TrendingUp sx={{ fontSize: 18, color: '#4facfe' }} />
                    <span>{creator.stats.revenue} Revenue</span>
                  </StatItem>
                  <StatItem>
                    <Star sx={{ fontSize: 18, color: '#f093fb' }} />
                    <span>{creator.stats.rating} Rating</span>
                  </StatItem>
                </StatsRow>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  {creator.courses.map((course, i) => (
                    <Chip
                      key={i}
                      label={course}
                      size="small"
                      sx={{
                        background: `linear-gradient(135deg, ${creator.thumbnail}22, ${creator.thumbnail}11)`,
                        color: creator.thumbnail,
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </CreatorCard>
          </motion.div>
        ))}
      </Box>
    </SectionContainer>
  );
};

