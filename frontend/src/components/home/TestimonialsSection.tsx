import { Box, Typography, Container, Card, CardContent, Avatar, styled, keyframes } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FormatQuote, Star, PlayCircle } from '@mui/icons-material';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const SectionContainer = styled(Container)`
  padding: 8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
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

const TestimonialCard = styled(motion.div)`
  height: 100%;
  border-radius: 24px;
  background: white;
  color: #1a1a1a;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
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
    transform: translateY(-15px) scale(1.03);
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const VideoThumbnail = styled(motion.div)`
  width: 100%;
  height: 200px;
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
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const PlayIcon = styled(motion.div)`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const QuoteIcon = styled(FormatQuote)`
  font-size: 4rem;
  color: #667eea;
  opacity: 0.15;
  margin-bottom: 1rem;
  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const TestimonialText = styled(Typography)`
  font-size: 1.1rem;
  line-height: 1.9;
  color: #333;
  margin-bottom: 2rem;
  font-style: italic;
  position: relative;
  z-index: 1;
`;

const AuthorInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const AuthorName = styled(Typography)`
  font-size: 1.2rem;
  font-weight: 800;
  color: #1a1a1a;
`;

const AuthorRole = styled(Typography)`
  font-size: 0.95rem;
  color: #666;
  margin-top: 0.25rem;
`;

const Rating = styled(Box)`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

export const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const testimonials = [
    {
      text: 'This platform transformed how I teach. I went from struggling to manage students to running a thriving online academy with thousands of learners. The tools are intuitive and the support is exceptional.',
      author: 'Sarah Chen',
      role: 'Digital Marketing Expert',
      avatar: 'SC',
      rating: 5,
      video: '#667eea',
    },
    {
      text: 'I\'ve tried multiple platforms, but nothing comes close to this. The community features, gamification, and analytics have helped me triple my revenue while making learning more engaging for my students.',
      author: 'Michael Rodriguez',
      role: 'Programming Instructor',
      avatar: 'MR',
      rating: 5,
      video: '#f093fb',
    },
    {
      text: 'As someone who was new to online teaching, I was worried about the technical aspects. This platform made everything so simple - I had my first course live within a week and students enrolled immediately.',
      author: 'Priya Sharma',
      role: 'Yoga & Wellness Coach',
      avatar: 'PS',
      rating: 5,
      video: '#4facfe',
    },
  ];

  return (
    <SectionContainer ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <SectionTitle>Success Stories from Our Community</SectionTitle>
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
          Hear from educators who have built thriving businesses using our platform
        </Typography>
      </motion.div>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 100, rotateX: -20 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.2,
              type: 'spring',
              stiffness: 100,
            }}
            style={{ flex: '1 1 320px', maxWidth: '400px' }}
            whileHover={{ y: -10 }}
          >
            <TestimonialCard
              whileHover={{ 
                rotateY: 5,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <VideoThumbnail
                style={{ background: `linear-gradient(135deg, ${testimonial.video}, ${testimonial.video}dd)` }}
                whileHover={{ scale: 1.05 }}
              >
                <PlayIcon
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <PlayCircle sx={{ fontSize: 50, color: '#667eea' }} />
                </PlayIcon>
              </VideoThumbnail>
              <CardContent sx={{ p: 3.5, position: 'relative' }}>
                <QuoteIcon />
                <TestimonialText>"{testimonial.text}"</TestimonialText>
                <AuthorInfo>
                  <Avatar
                    sx={{
                      width: 70,
                      height: 70,
                      bgcolor: testimonial.video,
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <AuthorName>{testimonial.author}</AuthorName>
                    <AuthorRole>{testimonial.role}</AuthorRole>
                    <Rating>
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} sx={{ fontSize: 18, color: '#FFD700' }} />
                      ))}
                    </Rating>
                  </Box>
                </AuthorInfo>
              </CardContent>
            </TestimonialCard>
          </motion.div>
        ))}
      </Box>
    </SectionContainer>
  );
};
