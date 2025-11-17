import { Box, Typography, Container, Grid, styled, keyframes } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Savings, TrendingUp, Security, SupportAgent, Speed, VerifiedUser } from '@mui/icons-material';

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(102, 126, 234, 0.6);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SectionContainer = styled(Container)`
  padding: 8rem 2rem;
  background: #ffffff;
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

const BenefitCard = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 24px;
  background: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s;
  }
  
  &:hover {
    transform: translateY(-15px) scale(1.05);
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.25);
    border-color: #667eea;
    
    &::before {
      opacity: 1;
    }
    
    .icon-wrapper::after {
      opacity: 1;
      animation: ${rotate} 2s linear infinite;
    }
  }
`;

const IconWrapper = styled(motion.div)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #667eea;
    border-right-color: #764ba2;
    opacity: 0;
    transition: opacity 0.4s;
  }
`;

const BenefitTitle = styled(Typography)`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #1a1a1a;
`;

const BenefitDescription = styled(Typography)`
  font-size: 1rem;
  color: #666;
  line-height: 1.8;
`;

export const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const benefits = [
    {
      icon: <Savings sx={{ fontSize: 60 }} />,
      title: 'Maximize Your Earnings',
      description: 'Keep more of what you earn with competitive pricing and transparent fee structures. No hidden costs, no surprises - just straightforward revenue sharing.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 60 }} />,
      title: 'Accelerate Your Growth',
      description: 'Built-in marketing tools and analytics help you understand your audience, optimize your content, and scale your business faster than ever before.',
    },
    {
      icon: <Security sx={{ fontSize: 60 }} />,
      title: 'Protect Your Content',
      description: 'Advanced security measures including DRM protection and anti-piracy systems ensure your intellectual property stays safe and your revenue protected.',
    },
    {
      icon: <SupportAgent sx={{ fontSize: 60 }} />,
      title: 'Expert Support Team',
      description: 'Get dedicated assistance from our team of specialists who understand your business needs and help you succeed at every stage of your journey.',
    },
    {
      icon: <Speed sx={{ fontSize: 60 }} />,
      title: 'Lightning-Fast Setup',
      description: 'Go from idea to launch in record time. Our intuitive platform eliminates technical barriers so you can focus on what matters - teaching and growing.',
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 60 }} />,
      title: 'Trusted by Thousands',
      description: 'Join a community of successful educators who have built thriving businesses on our platform. Your success is our mission.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
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
          Why Educators Choose Our Platform
        </SectionTitle>
        <Typography
          sx={{
            fontSize: '1.3rem',
            textAlign: 'center',
            color: '#666',
            marginBottom: '5rem',
            maxWidth: '700px',
            margin: '0 auto 5rem',
          }}
        >
          Discover the advantages that make us the preferred choice for knowledge entrepreneurs
        </Typography>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div variants={itemVariants}>
                <BenefitCard
                  whileHover={{ 
                    rotateY: 5,
                    rotateX: 5,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <IconWrapper
                    className="icon-wrapper"
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    {benefit.icon}
                  </IconWrapper>
                  <BenefitTitle>{benefit.title}</BenefitTitle>
                  <BenefitDescription>{benefit.description}</BenefitDescription>
                </BenefitCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </SectionContainer>
  );
};
