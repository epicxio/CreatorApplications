import { Box, Typography, Container, styled, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Rocket, ArrowForward } from '@mui/icons-material';

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(102, 126, 234, 0);
  }
`;

const SectionContainer = styled(Container)`
  padding: 8rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  border-radius: 40px;
  margin: 4rem auto;
  max-width: 1200px;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: ${pulse} 4s ease-in-out infinite;
  }
`;

const ContentBox = styled(Box)`
  text-align: center;
  position: relative;
  z-index: 1;
`;

const Title = styled(motion.h2)`
  font-size: 4rem;
  font-weight: 900;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(Typography)`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
`;

const CTAButton = styled(motion.button)`
  padding: 1.5rem 4rem;
  font-size: 1.3rem;
  font-weight: 700;
  border-radius: 50px;
  border: none;
  background: white;
  color: #667eea;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 400px;
    height: 400px;
  }
  
  span {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

export const CTASection = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <SectionContainer ref={ref}>
      <ContentBox>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <Title>Ready to Start Your Journey?</Title>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Subtitle>
            Join thousands of successful educators who are already building their knowledge empires. Start for free and scale at your own pace.
          </Subtitle>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <CTAButton
            onClick={() => navigate('/login')}
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 15px 50px rgba(0, 0, 0, 0.4)',
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 10px 40px rgba(0, 0, 0, 0.3)',
                '0 15px 50px rgba(102, 126, 234, 0.5)',
                '0 10px 40px rgba(0, 0, 0, 0.3)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            <span>
              <Rocket sx={{ fontSize: 28 }} />
              Get Started Now
              <ArrowForward sx={{ fontSize: 24 }} />
            </span>
          </CTAButton>
        </motion.div>
      </ContentBox>
    </SectionContainer>
  );
};

