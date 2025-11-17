import { Box, Typography, Container, styled, keyframes } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { PersonAdd, Create, Link as LinkIcon, Share, CheckCircle } from '@mui/icons-material';

const drawLine = keyframes`
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
`;

const SectionContainer = styled(Container)`
  padding: 8rem 2rem;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
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

const StepContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  position: relative;
  max-width: 900px;
  margin: 0 auto;
`;

const StepCard = styled(motion.div)`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  background: white;
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border-left: 5px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: linear-gradient(180deg, #667eea, #764ba2);
    transform: scaleY(0);
    transition: transform 0.4s;
  }
  
  &:hover {
    transform: translateX(20px) scale(1.02);
    box-shadow: 0 15px 50px rgba(102, 126, 234, 0.2);
    
    &::before {
      transform: scaleY(1);
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const IconWrapper = styled(motion.div)`
  width: 100px;
  height: 100px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    opacity: 0;
    filter: blur(10px);
    transition: opacity 0.4s;
  }
  
  &:hover::after {
    opacity: 0.5;
  }
`;

const StepNumber = styled(Box)`
  position: absolute;
  top: -15px;
  right: -15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
`;

const StepContent = styled(Box)`
  flex: 1;
`;

const StepTitle = styled(Typography)`
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #1a1a1a;
`;

const StepDescription = styled(Typography)`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
`;

const ConnectingLine = styled(motion.svg)`
  position: absolute;
  left: 50px;
  top: 120px;
  width: 4px;
  height: calc(100% - 240px);
  z-index: 0;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      number: 1,
      icon: <PersonAdd sx={{ fontSize: 50 }} />,
      title: 'Sign Up & Create Your Profile',
      description: 'Join our platform in seconds. Set up your creator profile, add your expertise areas, and customize your brand identity. No technical skills required - we guide you through every step.',
    },
    {
      number: 2,
      icon: <Create sx={{ fontSize: 50 }} />,
      title: 'Design Your First Offering',
      description: 'Choose what you want to teach - a comprehensive course, live workshop, or membership program. Use our intuitive builder to structure your content, add materials, and set pricing.',
    },
    {
      number: 3,
      icon: <LinkIcon sx={{ fontSize: 50 }} />,
      title: 'Connect Your Digital Products',
      description: 'Link your courses, workshops, or memberships together. Create bundles, set up prerequisites, and build learning paths that guide students through your content systematically.',
    },
    {
      number: 4,
      icon: <Share sx={{ fontSize: 50 }} />,
      title: 'Share & Start Earning',
      description: 'Publish your offerings and share them with your audience. Use our marketing tools, social media integrations, and analytics to reach more students and grow your revenue.',
    },
  ];

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
          Get Started in Minutes, Not Months
        </SectionTitle>
        <Typography
          sx={{
            fontSize: '1.3rem',
            textAlign: 'center',
            color: '#666',
            marginBottom: '4rem',
            maxWidth: '700px',
            margin: '0 auto 4rem',
          }}
        >
          Our streamlined process makes it incredibly simple to launch your educational business
        </Typography>
      </motion.div>

      <StepContainer>
        <ConnectingLine
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <motion.line
            x1="0"
            y1="0"
            x2="0"
            y2="100%"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeDasharray="1000"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 2, delay: 0.5 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
        </ConnectingLine>

        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -100, rotateY: -15 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.2,
              type: 'spring',
              stiffness: 100,
            }}
          >
            <StepCard
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <IconWrapper
                whileHover={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: 1.1,
                }}
                transition={{ duration: 0.5 }}
              >
                {step.icon}
                <StepNumber>{step.number}</StepNumber>
              </IconWrapper>
              <StepContent>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepContent>
            </StepCard>
          </motion.div>
        ))}
      </StepContainer>
    </SectionContainer>
  );
};
